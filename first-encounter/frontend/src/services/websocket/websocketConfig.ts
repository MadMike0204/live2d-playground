import type {
  WebSocketConfigErrors,
  WebSocketConfigValidation,
  WebSocketConnectionConfig,
} from './websocketTypes.js'

export const DEFAULT_WEBSOCKET_CONFIG: Readonly<WebSocketConnectionConfig> = Object.freeze({
  // 地址来自本地保存的 ExAPI 官方文档；实际端口允许用户覆盖。
  url: 'ws://127.0.0.1:10086/api',
  connectionTimeoutMs: 10000,
  autoReconnect: true,
  reconnectIntervalMs: 2000,
  maxReconnectAttempts: 5,
})

export const WEBSOCKET_CONFIG_STORAGE_KEY = 'first-encounter.websocket.config.v1'

/** 校验连接参数，同时将地址首尾空白移除。 */
export function validateWebSocketConfig(config: WebSocketConnectionConfig): WebSocketConfigValidation {
  const errors: WebSocketConfigErrors = {}
  const url = config.url.trim()

  try {
    const parsed = new URL(url)
    if (!['ws:', 'wss:'].includes(parsed.protocol) || !parsed.hostname) {
      errors.url = '请输入完整的 ws:// 或 wss:// 连接地址。'
    } else if (parsed.username || parsed.password || parsed.hash || url.includes('#')) {
      errors.url = '连接地址不能包含用户名、密码或 # 片段。'
    }
  } catch {
    errors.url = '请输入完整的 ws:// 或 wss:// 连接地址。'
  }

  const inRange = (value: number, min: number, max: number): boolean =>
    Number.isInteger(value) && value >= min && value <= max

  if (!inRange(config.connectionTimeoutMs, 1000, 60000)) {
    errors.connectionTimeoutMs = '连接超时应为 1000～60000 毫秒的整数。'
  }
  if (typeof config.autoReconnect !== 'boolean') {
    errors.autoReconnect = '请选择是否自动重连。'
  }
  const validInterval = inRange(config.reconnectIntervalMs, 500, 60000)
  const validAttempts = inRange(config.maxReconnectAttempts, 1, 20)
  if (config.autoReconnect && !validInterval) {
    errors.reconnectIntervalMs = '重连间隔应为 500～60000 毫秒的整数。'
  }
  if (config.autoReconnect && !validAttempts) {
    errors.maxReconnectAttempts = '重连次数应为 1～20 的整数。'
  }

  return Object.keys(errors).length > 0
    ? { valid: false, errors }
    : {
        valid: true,
        config: {
          ...config,
          url,
          // 关闭重连时不阻塞连接；无效的非活动字段回退到默认值。
          reconnectIntervalMs: validInterval ? config.reconnectIntervalMs : DEFAULT_WEBSOCKET_CONFIG.reconnectIntervalMs,
          maxReconnectAttempts: validAttempts ? config.maxReconnectAttempts : DEFAULT_WEBSOCKET_CONFIG.maxReconnectAttempts,
        },
      }
}

/** 恢复已保存的参数；损坏或不可用的本地存储不会阻止用户连接。 */
export function loadWebSocketConfig(): { config: WebSocketConnectionConfig; warning: string | null } {
  const fallback = (): WebSocketConnectionConfig => ({ ...DEFAULT_WEBSOCKET_CONFIG })
  try {
    const saved = localStorage.getItem(WEBSOCKET_CONFIG_STORAGE_KEY)
    if (!saved) return { config: fallback(), warning: null }
    const parsed: unknown = JSON.parse(saved)
    if (typeof parsed !== 'object' || parsed === null) throw new Error('Invalid configuration')
    const values = parsed as Record<string, unknown>
    if (
      typeof values.url !== 'string' ||
      typeof values.connectionTimeoutMs !== 'number' ||
      typeof values.autoReconnect !== 'boolean' ||
      typeof values.reconnectIntervalMs !== 'number' ||
      typeof values.maxReconnectAttempts !== 'number'
    ) throw new Error('Invalid configuration')

    const result = validateWebSocketConfig({
      url: values.url,
      connectionTimeoutMs: values.connectionTimeoutMs,
      autoReconnect: values.autoReconnect,
      reconnectIntervalMs: values.reconnectIntervalMs,
      maxReconnectAttempts: values.maxReconnectAttempts,
    })
    if (!result.valid) throw new Error('Invalid configuration')
    return { config: result.config, warning: null }
  } catch {
    return { config: fallback(), warning: '无法读取已保存的连接配置，已使用默认参数。' }
  }
}

/** 保存用户明确提交的配置，返回存储不可用时的提示。 */
export function saveWebSocketConfig(config: WebSocketConnectionConfig): string | null {
  try {
    localStorage.setItem(WEBSOCKET_CONFIG_STORAGE_KEY, JSON.stringify(config))
    return null
  } catch {
    return '连接参数已应用，但无法保存到本地；下次启动需要重新填写。'
  }
}
