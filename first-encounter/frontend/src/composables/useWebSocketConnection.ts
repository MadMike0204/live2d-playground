import { computed, onBeforeUnmount, reactive, ref, shallowRef } from 'vue'
import { WebSocketClient } from '../services/websocket/WebSocketClient.js'
import {
  DEFAULT_WEBSOCKET_CONFIG,
  loadWebSocketConfig,
  saveWebSocketConfig,
  validateWebSocketConfig,
} from '../services/websocket/websocketConfig.js'
import type {
  WebSocketConfigErrors,
  WebSocketConnectionConfig,
  WebSocketConnectionSnapshot,
} from '../services/websocket/websocketTypes.js'

/** 将连接能力映射为 Vue 状态，组件只负责输入与展示。 */
export function useWebSocketConnection() {
  const stored = loadWebSocketConfig()
  const config = reactive<WebSocketConnectionConfig>({ ...stored.config })
  const errors = ref<WebSocketConfigErrors>({})
  const notice = ref<string | null>(null)
  const storageWarning = ref<string | null>(stored.warning)
  const connection = shallowRef<Readonly<WebSocketConnectionSnapshot>>({
    status: 'idle', activeUrl: null, connectedAt: null, reconnectAttempt: 0, error: null,
  })
  const client = new WebSocketClient()
  const unsubscribe = client.subscribe((snapshot) => { connection.value = snapshot })
  const isActive = computed(() => ['connecting', 'connected', 'reconnecting'].includes(connection.value.status))
  const statusLabels = {
    idle: '未连接', connecting: '正在连接', connected: '已连接',
    reconnecting: '正在重连', disconnected: '已断开', error: '连接失败',
  } as const
  const statusLabel = computed(() => statusLabels[connection.value.status])
  const connectedAtLabel = computed(() => connection.value.connectedAt
    ? new Date(connection.value.connectedAt).toLocaleTimeString('zh-CN', { hour12: false })
    : '—')

  function validate(): WebSocketConnectionConfig | null {
    const result = validateWebSocketConfig(config)
    errors.value = result.valid ? {} : result.errors
    if (!result.valid) return null
    Object.assign(config, result.config)
    return result.config
  }

  /** 显式保存配置，不会因此自动连接。 */
  function save(): void {
    notice.value = null
    const validConfig = validate()
    if (!validConfig) return
    storageWarning.value = saveWebSocketConfig(validConfig)
    notice.value = storageWarning.value ? null : '连接配置已保存。'
  }

  /** 连接前校验并保存参数；存储失败仍允许建立连接。 */
  function connect(): void {
    notice.value = null
    const validConfig = validate()
    if (!validConfig) return
    storageWarning.value = saveWebSocketConfig(validConfig)
    client.connect(validConfig)
  }

  function disconnect(): void {
    client.disconnect()
    notice.value = null
  }

  /** 默认值先回填表单，由用户决定是否保存或连接。 */
  function reset(): void {
    Object.assign(config, DEFAULT_WEBSOCKET_CONFIG)
    errors.value = {}
    notice.value = '已恢复默认参数，保存后生效。'
  }

  const handleWindowExit = (event: PageTransitionEvent): void => {
    // 页面缓存恢复后仍可重新连接；真正退出时释放服务。
    if (event.persisted) client.disconnect()
    else client.dispose()
  }
  window.addEventListener('pagehide', handleWindowExit)
  onBeforeUnmount(() => {
    window.removeEventListener('pagehide', handleWindowExit)
    unsubscribe()
    client.dispose()
  })

  return {
    config, errors, notice, storageWarning, connection, isActive, statusLabel,
    connectedAtLabel, connect, disconnect, save, reset,
    send: client.send.bind(client),
    subscribeMessages: client.subscribeMessages.bind(client),
  }
}
