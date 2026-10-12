import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'

// 使用 Node 22.14+ 自带的类型擦除运行传输层测试，无需浏览器或额外测试依赖。
const sourceRoot = new URL('../src/services/websocket/', import.meta.url)
const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const configSource = stripTypeScriptTypes(await readFile(new URL('websocketConfig.ts', sourceRoot), 'utf8'))
const configUrl = moduleUrl(configSource)
const {
  DEFAULT_WEBSOCKET_CONFIG: defaults,
  validateWebSocketConfig,
  loadWebSocketConfig,
  saveWebSocketConfig,
  WEBSOCKET_CONFIG_STORAGE_KEY,
} = await import(configUrl)
const clientSource = stripTypeScriptTypes(await readFile(new URL('WebSocketClient.ts', sourceRoot), 'utf8'))
const { WebSocketClient } = await import(moduleUrl(clientSource.replace('./websocketConfig.js', configUrl)))

class FakeSocket {
  readyState = WebSocket.CONNECTING
  onopen = null
  onmessage = null
  onerror = null
  onclose = null
  sent = []
  closeCalls = 0

  constructor(url) { this.url = url }
  open() { this.readyState = WebSocket.OPEN; this.onopen?.({}) }
  fail() { this.onerror?.({}) }
  receive(data) { this.onmessage?.({ data }) }
  serverClose(code = 1006, reason = '') {
    this.readyState = WebSocket.CLOSED
    this.onclose?.({ code, reason })
  }
  close() { this.closeCalls += 1; this.readyState = WebSocket.CLOSED }
  send(data) { this.sent.push(data) }
}

function harness() {
  const sockets = []
  const timers = new Map()
  let timerId = 0
  let snapshot
  const client = new WebSocketClient({
    createSocket(url) { const socket = new FakeSocket(url); sockets.push(socket); return socket },
    schedule(callback, delayMs) { const id = ++timerId; timers.set(id, { callback, delayMs }); return id },
    cancel(id) { timers.delete(id) },
  })
  client.subscribe((next) => { snapshot = next })
  return {
    client, sockets, timers,
    get state() { return snapshot },
    runTimer() {
      assert.equal(timers.size, 1, '任一时刻只保留一个超时或重连计时器')
      const [id, timer] = timers.entries().next().value
      timers.delete(id)
      timer.callback()
    },
  }
}

test('校验地址、超时和重连范围；关闭重连时修复无效的非活动参数', () => {
  const valid = validateWebSocketConfig({ ...defaults, url: '  wss://localhost:10087/api  ' })
  assert.equal(valid.valid, true)
  assert.equal(valid.config.url, 'wss://localhost:10087/api')
  for (const url of ['http://localhost/api', '', 'ws://user:password@localhost/api', 'ws://localhost/api#fragment', 'ws://localhost/api#']) {
    assert.equal(validateWebSocketConfig({ ...defaults, url }).valid, false, url)
  }
  for (const patch of [{ connectionTimeoutMs: 0 }, { connectionTimeoutMs: 1.5 }, { reconnectIntervalMs: 499 }, { maxReconnectAttempts: 21 }]) {
    assert.equal(validateWebSocketConfig({ ...defaults, ...patch }).valid, false)
  }
  const disabled = validateWebSocketConfig({ ...defaults, autoReconnect: false, reconnectIntervalMs: NaN, maxReconnectAttempts: 0 })
  assert.equal(disabled.valid, true)
  assert.equal(disabled.config.maxReconnectAttempts, defaults.maxReconnectAttempts)
})

test('连接成功后清除超时，允许收发消息；取消订阅后不再接收消息', () => {
  const h = harness()
  const received = []
  const unsubscribe = h.client.subscribeMessages((data) => received.push(data))
  assert.throws(() => h.client.send('before connection'), /尚未连接/)
  h.client.connect({ ...defaults })
  assert.equal(h.state.status, 'connecting')
  assert.equal(h.timers.size, 1)
  h.sockets[0].open()
  assert.equal(h.state.status, 'connected')
  assert.equal(h.timers.size, 0)
  assert.ok(h.state.connectedAt)
  h.client.send('{"msg":10000,"msgId":1}')
  assert.equal(h.sockets[0].sent.length, 1)
  h.sockets[0].receive('reply')
  unsubscribe()
  h.sockets[0].receive('ignored')
  assert.deepEqual(received, ['reply'])
  h.client.dispose()
})

test('连接超时会关闭握手中的连接，关闭自动重连后停止尝试', () => {
  const h = harness()
  h.client.connect({ ...defaults, autoReconnect: false })
  h.runTimer()
  assert.equal(h.state.status, 'error')
  assert.match(h.state.error, /连接超时/)
  assert.equal(h.sockets[0].closeCalls, 1)
  assert.equal(h.timers.size, 0)
})

test('错误和随后到达的关闭事件只重试一次，达到重连上限后停止', () => {
  const h = harness()
  h.client.connect({ ...defaults, maxReconnectAttempts: 2 })
  const lateClose = h.sockets[0].onclose
  h.sockets[0].fail()
  lateClose({ code: 1006, reason: '' })
  assert.equal(h.state.reconnectAttempt, 1)
  assert.equal(h.timers.size, 1)
  h.runTimer()
  h.sockets[1].fail()
  assert.equal(h.state.reconnectAttempt, 2)
  h.runTimer()
  h.sockets[2].fail()
  assert.equal(h.sockets.length, 3)
  assert.equal(h.state.status, 'error')
  assert.match(h.state.error, /2 次重连上限/)
  assert.equal(h.timers.size, 0)
})

test('成功重连重置重试计数，且不会重发业务消息', () => {
  const h = harness()
  h.client.connect({ ...defaults })
  h.sockets[0].open()
  h.client.send('one command')
  h.sockets[0].serverClose()
  assert.equal(h.state.reconnectAttempt, 1)
  h.runTimer()
  h.sockets[1].open()
  assert.equal(h.state.status, 'connected')
  assert.equal(h.state.reconnectAttempt, 0)
  assert.equal(h.state.error, null)
  assert.deepEqual(h.sockets[1].sent, [])
  h.client.dispose()
})

test('手动取消握手和重连等待均释放连接及计时器', () => {
  for (const duringRetry of [false, true]) {
    const h = harness()
    h.client.connect({ ...defaults })
    const lateOpen = h.sockets[0].onopen
    if (duringRetry) h.sockets[0].fail()
    h.client.disconnect()
    lateOpen({})
    assert.equal(h.state.status, 'disconnected')
    assert.equal(h.timers.size, 0)
    assert.equal(h.sockets.length, 1)
    assert.throws(() => h.client.send('after disconnect'), /尚未连接/)
  }
})

test('替换连接时忽略旧连接迟到的消息和事件', () => {
  const h = harness()
  const received = []
  h.client.subscribeMessages((data) => received.push(data))
  h.client.connect({ ...defaults })
  const oldSocket = h.sockets[0]
  const lateOpen = oldSocket.onopen
  const lateMessage = oldSocket.onmessage
  const lateError = oldSocket.onerror
  h.client.connect({ ...defaults, url: 'ws://127.0.0.1:10087/api' })
  lateOpen({})
  lateMessage({ data: 'old message' })
  lateError({})
  assert.equal(h.state.status, 'connecting')
  assert.equal(h.state.activeUrl, 'ws://127.0.0.1:10087/api')
  assert.equal(h.timers.size, 1)
  assert.equal(oldSocket.closeCalls, 1)
  assert.deepEqual(received, [])
  h.sockets[1].open()
  h.client.dispose()
})

test('销毁服务会取消重连，不允许重新连接', () => {
  const h = harness()
  h.client.connect({ ...defaults })
  h.sockets[0].fail()
  h.client.dispose()
  assert.equal(h.timers.size, 0)
  assert.throws(() => h.client.connect({ ...defaults }), /已销毁/)
})

test('创建底层连接抛错会呈现失败状态；订阅者可立即取消重试', () => {
  let state
  const client = new WebSocketClient({ createSocket() { throw new Error('Unavailable') } })
  client.subscribe((next) => { state = next })
  client.connect({ ...defaults, autoReconnect: false })
  assert.equal(state.status, 'error')
  assert.match(state.error, /Unavailable/)
  const h = harness()
  h.client.subscribe((next) => { if (next.status === 'reconnecting') h.client.disconnect() })
  h.client.connect({ ...defaults })
  h.sockets[0].fail()
  assert.equal(h.state.status, 'disconnected')
  assert.equal(h.timers.size, 0)
})

test('保存和恢复配置；损坏的配置或不可用的存储不会阻止使用默认值', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const values = new Map()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem(key) { return values.get(key) ?? null },
    setItem(key, value) { values.set(key, value) },
  } })
  try {
    assert.deepEqual(loadWebSocketConfig().config, defaults)
    const custom = { ...defaults, url: 'ws://localhost:10090/api' }
    assert.equal(saveWebSocketConfig(custom), null)
    assert.deepEqual(loadWebSocketConfig().config, custom)
    for (const invalid of ['invalid json', '{}', JSON.stringify({ ...custom, maxReconnectAttempts: 999 })]) {
      values.set(WEBSOCKET_CONFIG_STORAGE_KEY, invalid)
      assert.ok(loadWebSocketConfig().warning)
      assert.deepEqual(loadWebSocketConfig().config, defaults)
    }
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Access denied') } })
    assert.ok(loadWebSocketConfig().warning)
    assert.match(saveWebSocketConfig(custom), /无法保存/)
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else delete globalThis.localStorage
  }
})
