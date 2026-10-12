import { validateWebSocketConfig } from './websocketConfig.js'
import type {
  WebSocketClientDependencies,
  WebSocketConnectionConfig,
  WebSocketConnectionSnapshot,
  WebSocketMessageListener,
  WebSocketPayload,
  WebSocketStateListener,
} from './websocketTypes.js'

/** 独立于框架的 WebSocket 客户端，管理超时、有限重连与连接清理。 */
export class WebSocketClient {
  private socket: WebSocket | null = null
  private timeoutTimer: number | null = null
  private reconnectTimer: number | null = null
  private config: WebSocketConnectionConfig | null = null
  private shouldConnect = false
  private disposed = false
  private generation = 0
  private readonly stateListeners = new Set<WebSocketStateListener>()
  private readonly messageListeners = new Set<WebSocketMessageListener>()
  private snapshot: Readonly<WebSocketConnectionSnapshot> = Object.freeze({
    status: 'idle',
    activeUrl: null,
    connectedAt: null,
    reconnectAttempt: 0,
    error: null,
  })
  private readonly dependencies: WebSocketClientDependencies

  constructor(dependencies: Partial<WebSocketClientDependencies> = {}) {
    this.dependencies = {
      createSocket: (url) => new WebSocket(url),
      schedule: (callback, delayMs) => window.setTimeout(callback, delayMs),
      cancel: (timer) => window.clearTimeout(timer),
      ...dependencies,
    }
  }

  /** 订阅状态，立即收到当前快照；返回取消订阅函数。 */
  subscribe(listener: WebSocketStateListener): () => void {
    this.stateListeners.add(listener)
    listener(this.snapshot)
    return () => this.stateListeners.delete(listener)
  }

  /** 订阅原始入站消息；协议解析由后续 ExAPI 模块负责。 */
  subscribeMessages(listener: WebSocketMessageListener): () => void {
    this.messageListeners.add(listener)
    return () => this.messageListeners.delete(listener)
  }

  /** 使用新参数连接；替换连接前会取消旧连接和全部等待任务。 */
  connect(config: WebSocketConnectionConfig): void {
    if (this.disposed) throw new Error('WebSocket 客户端已销毁。')
    const result = validateWebSocketConfig(config)
    if (!result.valid) throw new Error(Object.values(result.errors).join(' '))
    this.stop()
    this.config = { ...result.config }
    this.shouldConnect = true
    this.update({
      status: 'connecting',
      activeUrl: this.config.url,
      connectedAt: null,
      reconnectAttempt: 0,
      error: null,
    })
    this.open(this.generation)
  }

  /** 主动断开或取消连接，主动操作不会触发自动重连。 */
  disconnect(): void {
    this.stop()
    this.update({ status: 'disconnected', connectedAt: null, reconnectAttempt: 0, error: null })
  }

  /** 仅在连接已建立时发送；不会缓存或自动重发业务消息。 */
  send(payload: WebSocketPayload): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket 尚未连接，无法发送消息。')
    }
    this.socket.send(payload)
  }

  /** 页面退出时释放连接、计时器和订阅。 */
  dispose(): void {
    if (this.disposed) return
    this.stop()
    this.disposed = true
    this.update({ status: 'disconnected', connectedAt: null, reconnectAttempt: 0, error: null })
    this.stateListeners.clear()
    this.messageListeners.clear()
  }

  private update(patch: Partial<WebSocketConnectionSnapshot>): void {
    this.snapshot = Object.freeze({ ...this.snapshot, ...patch })
    this.stateListeners.forEach((listener) => listener(this.snapshot))
  }

  private clearTimers(): void {
    for (const timer of [this.timeoutTimer, this.reconnectTimer]) {
      if (timer !== null) this.dependencies.cancel(timer)
    }
    this.timeoutTimer = null
    this.reconnectTimer = null
  }

  private releaseSocket(): void {
    const socket = this.socket
    this.socket = null
    if (!socket) return
    // 先移除监听器，避免主动关闭和旧连接迟到的事件触发重连。
    socket.onopen = null
    socket.onmessage = null
    socket.onerror = null
    socket.onclose = null
    if (socket.readyState < WebSocket.CLOSING) socket.close(1000, 'Client disconnect')
  }

  private stop(): void {
    this.shouldConnect = false
    this.generation += 1
    this.clearTimers()
    this.releaseSocket()
  }

  private open(generation: number): void {
    if (!this.shouldConnect || generation !== this.generation || !this.config) return
    const config = this.config
    let socket: WebSocket
    try {
      socket = this.dependencies.createSocket(config.url)
    } catch (error: unknown) {
      this.failed(generation, error instanceof Error ? error.message : '无法创建 WebSocket 连接。')
      return
    }
    this.socket = socket
    const isCurrent = (): boolean =>
      this.shouldConnect && generation === this.generation && this.socket === socket

    this.timeoutTimer = this.dependencies.schedule(() => {
      if (isCurrent()) this.failed(generation, `连接超时（${config.connectionTimeoutMs} 毫秒），请检查服务和连接地址。`)
    }, config.connectionTimeoutMs)

    socket.onopen = () => {
      if (!isCurrent()) return
      this.clearTimers()
      this.update({ status: 'connected', connectedAt: new Date().toISOString(), reconnectAttempt: 0, error: null })
    }
    socket.onmessage = (event: MessageEvent<unknown>) => {
      if (isCurrent()) this.messageListeners.forEach((listener) => listener(event.data))
    }
    socket.onerror = () => {
      if (isCurrent()) this.failed(generation, 'WebSocket 连接失败，请检查服务是否运行以及地址、端口是否正确。')
    }
    socket.onclose = (event: CloseEvent) => {
      if (!isCurrent()) return
      const reason = event.reason ? `：${event.reason}` : ''
      this.failed(generation, `连接已关闭（代码 ${event.code}）${reason}`)
    }
  }

  private failed(generation: number, error: string): void {
    if (!this.shouldConnect || generation !== this.generation || !this.config) return
    this.clearTimers()
    this.releaseSocket()
    const attempt = this.snapshot.reconnectAttempt
    if (!this.config.autoReconnect || attempt >= this.config.maxReconnectAttempts) {
      this.shouldConnect = false
      const exhausted = this.config.autoReconnect ? `已达到 ${attempt} 次重连上限。` : ''
      this.update({ status: 'error', connectedAt: null, error: error + exhausted })
      return
    }
    this.update({ status: 'reconnecting', connectedAt: null, reconnectAttempt: attempt + 1, error })
    if (!this.shouldConnect || generation !== this.generation) return
    // 重连只恢复传输连接，不重放之前发送的 ExAPI 指令。
    this.reconnectTimer = this.dependencies.schedule(() => {
      this.reconnectTimer = null
      this.open(generation)
    }, this.config.reconnectIntervalMs)
  }
}
