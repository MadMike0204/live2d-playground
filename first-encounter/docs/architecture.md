# 架构与 ExAPI 接入方向

## 职责

本应用是 Live2DViewerEX 的控制与管理层。外部 Live2DViewerEX 接收 ExAPI 消息，执行模型、背景、特效、气泡等操作并负责渲染。

目标数据流：

```text
Vue 控制面板 ↔ TypeScript ExAPI 客户端 ↔ WebSocket ↔ Live2DViewerEX
```

目标平台固定为 Windows 桌面端，界面适配桌面窗口缩放，不开发手机端布局。Wails 提供桌面窗口、资源加载和打包。业务优先用 TypeScript；遇到浏览器能力限制或原生系统能力需求时，再增加少量 Go。前端运行在 WebView 中，不能直接调用 Node.js 的 fs、net 等模块。

## 已实现

main.go 创建 1024 × 768 窗口并嵌入前端产物。Vue 展示连接配置面板，没有 Go 业务绑定。保留 Wails runtime 桥接代码供后续窗口控制使用。

| 模块 | 职责 |
| --- | --- |
| frontend/src/services/websocket/WebSocketClient.ts | 原生 WebSocket 包装，连接、发送、消息订阅、超时、有限重连与释放；不依赖 Vue |
| frontend/src/services/websocket/websocketTypes.ts | 配置、状态快照、订阅和依赖接口 |
| frontend/src/services/websocket/websocketConfig.ts | 官方默认地址、参数校验、版本化 localStorage 配置 |
| frontend/src/composables/useWebSocketConnection.ts | 管理响应式表单和连接状态，暴露保存、连接、断开等动作，退出时释放服务 |
| frontend/src/components/WebSocketConnectionPanel.vue | 输入、校验提示、连接状态展示与操作绑定 |

当前页面创建一个连接状态 composable 和一个客户端。后续多个控制面板应复用同一个实例，避免重复连接。`send` 与 `subscribeMessages` 提供通用传输能力；尚未进行 ExAPI 协议解析。客户端不添加未在官方协议中定义的鉴权字段或心跳命令，也不自动重发业务指令。

重连次数表示当前连续失败周期内的重试次数，不包含首次连接；连接成功后计数归零。主动断开、取消连接、替换连接和销毁服务都会清理旧计时器及监听器，忽略旧连接迟到的事件。

## 后续 ExAPI 模块规划

| 位置 | 职责 |
| --- | --- |
| frontend/src/services/exapi/ | 连接生命周期、协议类型、消息收发 |
| frontend/src/composables/ | 在现有连接状态之上扩展 ExAPI 状态与多步骤业务流程 |
| frontend/src/components/ | 各类控制面板 |

连接实现独立于展示组件，避免重复连接。关闭连接时清理监听器和重连计时器。心跳、鉴权和响应关联机制根据真实协议实现。

## 接入顺序

1. 核实目标 Live2DViewerEX 版本的 ExAPI 文档、启用方式、地址、端口和鉴权要求。
2. 定义消息类型，实现连接、发送、接收和主动断开。
3. 验证一个真实命令及响应，再逐步增加控制面板。
4. 增加连接状态、错误提示，以及协议需要的超时、心跳与重连。

官方文档的本地快照见 [ExAPI 开发参考](live2d-viewer-ex-api.md)，包含默认 WebSocket 地址、端口回退规则和 18 个 API 条目。目标软件版本、实际运行端口和联机行为尚未验证，配置变量尚未定义；原文示例存在格式问题，发送消息前需按参考文档中的备注处理。

浏览器 WebSocket 不能任意设置握手请求头，服务也可能检查 Origin；遇到此类限制再评估 Go 连接方案。Go 不能保证随桌面应用分发的密钥无法提取，整个桌面进程退出后也无法继续维持连接。
