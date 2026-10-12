/** 用户可配置的 WebSocket 连接参数。 */
export interface WebSocketConnectionConfig {
  url: string
  connectionTimeoutMs: number
  autoReconnect: boolean
  reconnectIntervalMs: number
  maxReconnectAttempts: number
}

export type WebSocketConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error'

/** 传输层只暴露连接信息，不依赖 Vue 或具体 ExAPI 消息结构。 */
export interface WebSocketConnectionSnapshot {
  status: WebSocketConnectionStatus
  activeUrl: string | null
  connectedAt: string | null
  reconnectAttempt: number
  error: string | null
}

export type WebSocketConfigErrors = Partial<Record<keyof WebSocketConnectionConfig, string>>

export type WebSocketConfigValidation =
  | { valid: true; config: WebSocketConnectionConfig }
  | { valid: false; errors: WebSocketConfigErrors }

export type WebSocketPayload = Parameters<WebSocket['send']>[0]
export type WebSocketMessageListener = (data: unknown) => void
export type WebSocketStateListener = (snapshot: Readonly<WebSocketConnectionSnapshot>) => void

/** 可注入底层连接及计时器，便于脱离浏览器验证连接生命周期。 */
export interface WebSocketClientDependencies {
  createSocket: (url: string) => WebSocket
  schedule: (callback: () => void, delayMs: number) => number
  cancel: (timer: number) => void
}
