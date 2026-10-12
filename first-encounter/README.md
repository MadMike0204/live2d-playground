# first-encounter

Live2DViewerEX 的桌面控制与管理应用。Vue 3 + TypeScript 负责界面和后续 ExAPI 客户端，Wails v2 负责桌面窗口与打包。

目标平台固定为 **Windows 桌面端**。界面适配桌面窗口缩放，不开发手机端布局。

## 当前状态

启动后显示 WebSocket 连接设置。用户可配置地址、连接超时、自动重连、重连间隔和次数上限，查看连接状态，并主动连接、取消或断开。

默认地址为 `ws://127.0.0.1:10086/api`。点击“保存配置”或“连接”会将参数保存到当前 WebView 的 localStorage；下次启动恢复参数，但不会自动连接。存储不可用时仍可连接。连接期间先断开再修改参数，保存后的新参数在下一次连接时使用。

传输服务提供原始消息收发、超时和有限次数重连。主动断开或页面退出会取消计时器并清理连接；重连不会重放业务消息。尚未实现 ExAPI 命令封装、模型控制、本地 Live2D 渲染或 Go 业务绑定。浏览器检查不代表已经验证与目标 Live2DViewerEX 版本的联机行为。

## 开发

需要 Go（满足 go.mod 的版本要求）、Node.js（满足 Vite 7 要求：20.19+ 或 22.12+）、Wails v2 CLI。Windows 桌面运行需要 WebView2 Runtime，用 `wails doctor` 检查环境。

从仓库根目录执行：

```powershell
cd first-encounter/frontend
npm ci
cd ..
wails dev
```

Wails 启动前端开发服务与桌面窗口。只开发浏览器页面时，在 frontend/ 中执行 `npm run dev`；浏览器不能使用 Wails 桌面 runtime 能力。

## 检查与构建

在 frontend/ 中执行 `npm run build`，检查 TypeScript 并生成 frontend/dist/。

在 frontend/ 中执行 `npm test`，验证连接参数、收发、超时、重连上限、取消、旧事件隔离与本地配置恢复。测试使用 Node 自带的类型擦除功能，需要 Node.js **22.14+**。

在本目录执行 `wails build`，桌面应用输出到 build/bin/。Go 嵌入前端产物，单独编译 Go 前需要先构建前端。

保留 build/ 中的打包图标、平台配置和安装器脚本。依赖目录、frontend/dist/、build/bin/ 已被 Git 忽略；锁文件与环境配置示例保留。

## 结构

- main.go：Wails 启动与窗口配置。
- wails.json：开发与构建设置。
- frontend/src/：Vue + TypeScript 页面源码。
- frontend/src/services/websocket/：独立 WebSocket 传输服务、参数类型、校验与本地保存。
- frontend/src/composables/useWebSocketConnection.ts：连接状态与界面操作。
- frontend/src/components/WebSocketConnectionPanel.vue：Windows 桌面连接配置面板。
- frontend/wailsjs/：Wails 生成的前端桥接代码。
- build/：桌面打包源配置。
- docs/：架构说明与 ExAPI 官方文档的本地 Markdown 快照。

后续方向见 [架构说明](docs/architecture.md)。

开发 ExAPI 客户端前参考 [本地 API 文档入口](docs/live2d-viewer-ex-api.md)，其中包含 API 结构、18 个 API 条目、EX 脚本及原始示例的格式备注。
