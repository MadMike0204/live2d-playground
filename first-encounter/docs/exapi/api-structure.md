# API结构

> 来源：[https://live2d.pavostudio.com/doc/zh-cn/exapi/api-structure/](https://live2d.pavostudio.com/doc/zh-cn/exapi/api-structure/)
>
> 抓取日期：2026-10-11（北京时间）。以下为官方正文的 Markdown 转存，保留原始示例；有效 JSON 标为 `json`，其他示例标为 `text`。

<a id="websocket"></a>

### WebSocket接口

```text
ws://127.0.0.1:10086/api
```

> **关于端口号**
>
> 应用默认端口号为10086，但由于系统环境的不同，可能存在端口号被占用的情况。目前采取的措施是从默认端口号向后找到第一个绑定成功的端口号。若遇到此情况请使用托盘应用的“运行”功能运行您的程序，此方式将当前应用端口号作为参数传递给程序

<a id="json"></a>

### JSON结构

```text
{
  "msg": 10000,
  "msgId": 1,
  "data": some data
}
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| msg | int | 消息类型 |
| msgId | int | 消息标识符 |
| data | object | 数据对象 |
