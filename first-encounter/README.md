# first-encounter

Live2DViewerEX 的桌面控制与管理应用。Vue 3 + TypeScript 负责界面和后续 ExAPI 客户端，Wails v2 负责桌面窗口与打包。

## 当前状态

启动后显示白屏。已移除问候示例、前端 Logo 和示例字体。尚未实现 ExAPI 连接、命令、状态管理或配置持久化。没有本地 Live2D 渲染逻辑，也没有 Go 业务绑定。

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

在本目录执行 `wails build`，桌面应用输出到 build/bin/。Go 嵌入前端产物，单独编译 Go 前需要先构建前端。

保留 build/ 中的打包图标、平台配置和安装器脚本。依赖目录、frontend/dist/、build/bin/ 已被 Git 忽略；锁文件与环境配置示例保留。

## 结构

- main.go：Wails 启动与窗口配置。
- wails.json：开发与构建设置。
- frontend/src/：Vue + TypeScript 页面源码。
- frontend/wailsjs/：Wails 生成的前端桥接代码。
- build/：桌面打包源配置。
- docs/：架构说明。

后续方向见 [架构说明](docs/architecture.md)。