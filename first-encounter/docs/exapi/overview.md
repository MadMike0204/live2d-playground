# 总览

> 来源：[https://live2d.pavostudio.com/doc/zh-cn/exapi/](https://live2d.pavostudio.com/doc/zh-cn/exapi/)
>
> 抓取日期：2026-10-11（北京时间）。以下为官方正文的 Markdown 转存，保留原始示例；有效 JSON 标为 `json`，其他示例标为 `text`。

此文档适用于想要通过API让第三方软件与Live2DViewerEX相互通信的开发者

<a id="exapi"></a>

### 关于ExAPI

ExAPI是一个基于Live2DViewerEX的WebSocket API组 <br> 通过ExAPI您可以控制许多Live2DViewerEX的内容，比如模型、背景、特效、气泡等等

<a id="_1"></a>

### 使用场景

- 当您收到一个新邮件或消息时，您可以将通知推送到Live2DViewerEX，利用文本气泡展示您收到的推送消息。
- 您可以发送系统资源使用数据至Live2DViewerEX，那里会提供一个小部件来展示这些数据。
- 您可以发送天气数据至Live2DViewerEX，并可以控制下雨或下雪特效来适配当前天气状况。
- 您可以编写您自己的背景幻灯片程序，通过ExAPI在Live2DViewerEX里替换背景。
- 您可以在您的软件内集成Google Voice、Siri或其应用来识别语音，然后转换成文本或者选择项，发送到Live2DViewerEX并展示这些文本和选择项。
- ...

<a id="_2"></a>

### 使用示例

[https://github.com/pavostudio/ExAPI](https://github.com/pavostudio/ExAPI)
