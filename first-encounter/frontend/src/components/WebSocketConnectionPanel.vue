<script setup lang="ts">
import { useWebSocketConnection } from '../composables/useWebSocketConnection'

const {
  config, errors, notice, storageWarning, connection, isActive,
  statusLabel, connectedAtLabel, connect, disconnect, save, reset,
} = useWebSocketConnection()
</script>

<template>
  <section class="connection-panel" aria-labelledby="connection-title">
    <header class="panel-header">
      <div>
        <p class="eyebrow">LIVE2DVIEWEREX</p>
        <h1 id="connection-title">连接设置</h1>
        <p class="intro">连接 Live2DViewerEX，为后续模型控制做好准备。</p>
      </div>
      <span class="status-badge" :data-status="connection.status" role="status" aria-live="polite">
        <span class="status-dot" aria-hidden="true" />{{ statusLabel }}
      </span>
    </header>

    <form novalidate @submit.prevent="connect">
      <fieldset :disabled="isActive" class="settings-fields">
        <legend class="sr-only">WebSocket 连接参数</legend>
        <div class="basic-fields">
        <div class="field">
          <label for="connection-url">连接地址</label>
          <input id="connection-url" v-model="config.url" type="text" placeholder="ws://127.0.0.1:10086/api"
            spellcheck="false" autocomplete="off" :aria-invalid="!!errors.url"
            :aria-describedby="errors.url ? 'url-help url-error' : 'url-help'" />
          <p id="url-help" class="field-help">支持 ws:// 和 wss://。默认端口为 10086；如被占用，请填写实际端口。</p>
          <p v-if="errors.url" id="url-error" class="field-error">{{ errors.url }}</p>
        </div>

        <div class="field compact-field">
          <label for="connection-timeout">连接超时 <span class="label-unit">毫秒</span></label>
          <input id="connection-timeout" v-model.number="config.connectionTimeoutMs" type="number"
            min="1000" max="60000" step="1000" :aria-invalid="!!errors.connectionTimeoutMs"
            :aria-describedby="errors.connectionTimeoutMs ? 'timeout-help timeout-error' : 'timeout-help'" />
          <p id="timeout-help" class="field-help">等待连接建立的最长时间，范围 1000～60000。</p>
          <p v-if="errors.connectionTimeoutMs" id="timeout-error" class="field-error">{{ errors.connectionTimeoutMs }}</p>
        </div>
        </div>

        <div class="reconnect-section">
          <label class="checkbox-label" for="auto-reconnect">
            <input id="auto-reconnect" v-model="config.autoReconnect" type="checkbox" />
            <span>自动重连</span>
          </label>
          <p class="field-help">连接失败或意外断开时自动尝试恢复。主动断开后不会重连。</p>

          <div class="retry-fields">
            <div class="field">
              <label for="reconnect-interval">重连间隔 <span class="label-unit">毫秒</span></label>
              <input id="reconnect-interval" v-model.number="config.reconnectIntervalMs" type="number"
                min="500" max="60000" step="500" :disabled="!config.autoReconnect"
                :aria-invalid="!!errors.reconnectIntervalMs"
                :aria-describedby="errors.reconnectIntervalMs ? 'interval-help interval-error' : 'interval-help'" />
              <p id="interval-help" class="field-help">每次重试前等待 500～60000 毫秒。</p>
              <p v-if="errors.reconnectIntervalMs" id="interval-error" class="field-error">{{ errors.reconnectIntervalMs }}</p>
            </div>
            <div class="field">
              <label for="reconnect-attempts">最多重连次数</label>
              <input id="reconnect-attempts" v-model.number="config.maxReconnectAttempts" type="number"
                min="1" max="20" step="1" :disabled="!config.autoReconnect"
                :aria-invalid="!!errors.maxReconnectAttempts"
                :aria-describedby="errors.maxReconnectAttempts ? 'attempts-help attempts-error' : 'attempts-help'" />
              <p id="attempts-help" class="field-help">范围 1～20 次，不包含首次连接。</p>
              <p v-if="errors.maxReconnectAttempts" id="attempts-error" class="field-error">{{ errors.maxReconnectAttempts }}</p>
            </div>
          </div>
        </div>
      </fieldset>

      <div class="form-actions">
        <button v-if="!isActive" type="submit" class="button button-primary">连接</button>
        <button v-else type="button" class="button button-disconnect" @click="disconnect">
          {{ connection.status === 'connected' ? '断开连接' : '取消连接' }}
        </button>
        <button type="button" class="button button-secondary" :disabled="isActive" @click="save">保存配置</button>
        <button type="button" class="button button-text" :disabled="isActive" @click="reset">恢复默认</button>
      </div>
      <p class="save-hint">连接时自动保存配置，下次启动会恢复参数；启动后需手动连接。</p>
      <p v-if="isActive" class="field-help">如需修改参数，请先断开或取消连接。</p>
    </form>

    <div v-if="notice" class="notice notice-success" role="status">{{ notice }}</div>
    <div v-if="storageWarning" class="notice notice-warning" role="status">{{ storageWarning }}</div>
    <div v-if="connection.error" class="notice notice-error" role="alert">
      <p>{{ connection.error }}</p>
      <p v-if="connection.status === 'reconnecting'">第 {{ connection.reconnectAttempt }} / {{ config.maxReconnectAttempts }} 次重连，间隔 {{ config.reconnectIntervalMs }} 毫秒。</p>
    </div>

    <footer class="connection-details" aria-label="当前连接信息">
      <div><span>本次连接地址</span><strong class="endpoint">{{ connection.activeUrl ?? '—' }}</strong></div>
      <div><span>连接建立时间</span><strong>{{ connectedAtLabel }}</strong></div>
    </footer>
  </section>
</template>

<style scoped>
.connection-panel { width: 100%; max-width: 800px; padding: 32px; border: 1px solid #dfe5ee; border-radius: 16px; background: #fff; box-shadow: 0 8px 32px #152b4510; }
.panel-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 28px; }
.eyebrow { margin: 0 0 8px; color: #52657c; font-size: 11px; font-weight: 700; letter-spacing: .14em; }
h1 { margin: 0; color: #1b2b41; font-size: 26px; letter-spacing: -.025em; }
.intro { margin: 10px 0 0; color: #65748a; font-size: 14px; line-height: 1.6; }
.status-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; flex-shrink: 0; border-radius: 999px; color: #52657c; background: #eef2f7; font-size: 12px; font-weight: 600; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.status-badge[data-status='connected'] { color: #137650; background: #e6f6ee; }
.status-badge[data-status='connecting'], .status-badge[data-status='reconnecting'] { color: #2463c5; background: #edf3ff; }
.status-badge[data-status='error'] { color: #b4333c; background: #fff0f0; }
.settings-fields { min-width: 0; margin: 0; padding: 0; border: 0; }
.basic-fields { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 24px; }
.field { display: flex; min-width: 0; flex-direction: column; gap: 8px; margin-bottom: 24px; }
label { color: #27384e; font-size: 14px; font-weight: 600; }
.label-unit { margin-left: 6px; color: #758499; font-size: 12px; font-weight: 400; }
input[type='text'], input[type='number'] { box-sizing: border-box; width: 100%; height: 42px; border: 1px solid #c9d3e0; border-radius: 7px; padding: 0 12px; color: #22354d; background: #fff; font: inherit; font-size: 14px; }
input[type='text'] { font-family: ui-monospace, Consolas, monospace; }
input:focus-visible { outline: 3px solid #3277e428; outline-offset: 1px; border-color: #3979d7; }
input[aria-invalid='true'] { border-color: #c83a45; }
input:disabled { color: #718098; background: #f3f5f8; cursor: not-allowed; }
.compact-field { max-width: 350px; }
.field-help, .field-error, .save-hint { margin: 0; font-size: 12px; line-height: 1.6; }
.field-help, .save-hint { color: #65748a; }
.field-error { color: #bc303e; }
.reconnect-section { padding: 22px 0 0; border-top: 1px solid #e8edf4; }
.checkbox-label { display: flex; align-items: center; gap: 10px; width: fit-content; margin-bottom: 8px; cursor: pointer; }
input[type='checkbox'] { width: 16px; height: 16px; margin: 0; accent-color: #286bce; }
.retry-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 20px; }
.form-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 2px 0 12px; }
.button { min-height: 40px; padding: 0 18px; border: 1px solid transparent; border-radius: 7px; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
.button-primary { color: #fff; background: #286bce; }
.button-primary:hover { background: #1f59ae; }
.button-secondary { color: #2b425e; background: #fff; border-color: #c9d3e0; }
.button-secondary:hover { background: #f4f7fb; }
.button-disconnect { color: #b3303d; background: #fff; border-color: #dfaeb3; }
.button-text { color: #64758c; background: transparent; }
.button:focus-visible { outline: 3px solid #3277e460; outline-offset: 3px; }
.button:disabled { opacity: .5; cursor: not-allowed; }
.notice { margin-top: 18px; padding: 12px 14px; border-radius: 7px; font-size: 13px; line-height: 1.7; overflow-wrap: anywhere; }
.notice p { margin: 0; }
.notice-success { color: #126345; background: #edf8f2; }
.notice-warning { color: #835d16; background: #fff8e9; }
.notice-error { color: #ab2935; background: #fff1f2; }
.connection-details { display: grid; grid-template-columns: minmax(0, 1fr) 140px; gap: 24px; margin-top: 26px; padding-top: 20px; border-top: 1px solid #e8edf4; font-size: 12px; }
.connection-details div { display: flex; min-width: 0; flex-direction: column; gap: 8px; }
.connection-details span { color: #65748a; }
.connection-details strong { color: #3b4e67; font-weight: 500; }
.endpoint { overflow-wrap: anywhere; font-family: ui-monospace, Consolas, monospace; }
/* 适配 Windows 窗口缩放；应用保留桌面端的最小布局宽度。 */
@media (max-width: 800px) { .connection-panel { padding: 24px; } .panel-header { gap: 16px; } .basic-fields, .retry-fields { gap: 16px; } }
</style>
