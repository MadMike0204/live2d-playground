# 项目约定

- 应用目录是 first-encounter/，Wails 命令在该目录执行。
- 通过 ExAPI 控制 Live2DViewerEX，渲染由外部应用负责。
- 核心业务优先用 TypeScript；Go 保持为 Wails 外壳，遇到明确原生能力需求再扩展。
- 不把连接、协议解析与重连逻辑堆进 Vue 展示组件。
- 实现 ExAPI 前核实对应版本的文档，不猜测端口、命令字段或鉴权方式。
- frontend/wailsjs/ 是生成代码，不手动修改。
- 保留打包源配置、锁文件与环境配置示例，不提交本地凭据和构建产物。
- 前端检查：在 first-encounter/frontend/ 执行 `npm run build`。
- 桌面构建：在 first-encounter/ 执行 `wails build`。

## 深入文档

- [开发与构建](first-encounter/README.md)
- [职责与接入方向](first-encounter/docs/architecture.md)