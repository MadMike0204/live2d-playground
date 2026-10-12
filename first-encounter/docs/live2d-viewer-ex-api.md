# Live2DViewerEX ExAPI 本地开发参考

本地快照抓取于 **2026-10-11（北京时间）**，来源为 [Pavo Studio 官方 ExAPI 文档](https://live2d.pavostudio.com/doc/zh-cn/exapi/)。本页是开发导航和阅读备注；下列四份 Markdown 保存官方页面正文，包括参数表、请求示例、已提供的回应、事件列表和提示。

## 文档入口

| 本地文档 | 内容 | 官方来源 |
| --- | --- | --- |
| [总览](exapi/overview.md) | ExAPI 介绍、使用场景、官方示例仓库链接 | [总览](https://live2d.pavostudio.com/doc/zh-cn/exapi/) |
| [API 结构](exapi/api-structure.md) | WebSocket 地址、端口回退规则、消息结构 | [API 结构](https://live2d.pavostudio.com/doc/zh-cn/exapi/api-structure/) |
| [API 列表](exapi/api-list.md) | 全部 18 个 API 条目、20 张参数/枚举表、38 个原始代码块 | [API 列表](https://live2d.pavostudio.com/doc/zh-cn/exapi/api-list/) |
| [EX 脚本](exapi/ex-script.md) | 20 条配置脚本指令、执行入口、参数及官方模板全文 | [EX 脚本](https://live2d.pavostudio.com/doc/zh-cn/exapi/ex-script/) |

已核对四个页面的站点导航，ExAPI 栏目内链接均已覆盖。正文中的外部链接继续指向原站；EX 脚本直接引用的 [template.txt](https://live2d.pavostudio.com/sample/template.txt) 已作为附录收入本地文档。四份正文共保留 40 张表格、61 个原始代码块，另加 1 个官方模板代码块。

页面未注明适用的 Live2DViewerEX 版本号或最后更新时间，因此抓取日期仅代表快照日期。正式接入时仍需核对目标软件版本并联机验证。

## 连接与消息结构

官方给出的默认接口为 `ws://127.0.0.1:10086/api`。端口被占用时，Live2DViewerEX 会从默认端口向后寻找第一个绑定成功的端口；官方建议通过托盘应用的“运行”功能启动客户端，当前端口会作为参数传入。页面没有说明该参数的具体名称或排列方式。

| 字段 | 官方说明 | 开发时需要注意 |
| --- | --- | --- |
| `msg` | `int`，消息类型 | 对应下方 API 编号 |
| `msgId` | `int`，消息标识符 | 示例均为 `1`；文档未详细定义唯一性、递增规则或所有回应的关联保证 |
| `data` | 结构页写作 `object`，数据对象 | 实际 API 中可以缺省、为整数或为对象，须按具体条目定义类型 |

例如注册模型事件监听的请求与回应均为：

```json
{
  "msg": 10000,
  "msgId": 1
}
```

这份快照没有定义鉴权字段、心跳命令、错误码或每条命令必定返回确认消息的规则；这些能力需要另行核实。`10002` 是发给已注册客户端的模型事件通知，不能作为客户端控制命令使用。

## API 速查

| msg | API |
| --- | --- |
| `10000` | [注册模型事件监听](exapi/api-list.md#10000) |
| `10001` | [取消注册模型事件监听](exapi/api-list.md#10001) |
| `10002` | [接收模型事件通知](exapi/api-list.md#10002) |
| `11000` | [显示气泡文本](exapi/api-list.md#11000) |
| `12010` | [设置背景](exapi/api-list.md#12010) |
| `12110` | [设置360全景背景](exapi/api-list.md#12110-360) |
| `13000` | [设置模型](exapi/api-list.md#13000) |
| `13100` | [移除模型](exapi/api-list.md#13100) |
| `13200` | [触发动作](exapi/api-list.md#13200) |
| `13300` | [设置表情](exapi/api-list.md#13300) |
| `13301` | [下一个表情](exapi/api-list.md#13301) |
| `13302` | [清除表情](exapi/api-list.md#13302) |
| `13400` | [设置位置](exapi/api-list.md#13400) |
| `13500` | [播放声音](exapi/api-list.md#13500) |
| `13501` | [停止声音](exapi/api-list.md#13501) |
| `14000` | [设置特效](exapi/api-list.md#14000) |
| `14100` | [添加特效](exapi/api-list.md#14100) |
| `14200` | [移除特效](exapi/api-list.md#14200) |

## 开发阅读备注

以下是根据这次抓取整理的备注，官方原文仍完整保存在对应文件中。

- WebSocket API 的模型/显示器 `id` 从 **0** 开始；EX 脚本的模型 `slot` 为 **1～8**，不要混用两种编号。
- `13400` 的 `posX`、`posY` 是以**屏幕左下角**为原点的像素坐标；EX 脚本的 `set_model_position` 使用相对于**屏幕中心**的位置。
- `13000` 的官方页面写明“目前仅支持 json 模型”，路径字段说明为 `*.model.json`。加载 LPK 的操作见 EX 脚本，不能据此推断 WebSocket API 支持 LPK。
- `13200`：`type=0` 时 `mtn` 为动作组名或 `group:motion`；`type=1` 时为动作文件绝对路径。
- `13500`：`type=0` 时 `sound` 为文件绝对路径；`type=1` 时为音频二进制的 Base64 字符串。支持 MP3、OGG、WAV，频道为 `0`、`1`、`2`。
- 气泡 `duration`、音频 `delay` 的单位为毫秒；气泡 `duration=-1` 表示不自动消失。音量范围为 `0～1`。
- 已列出的特效 ID 为雨 `100100`、雪 `100110`；移除特效时 `data=-1` 表示移除全部特效。
- 总览提到的使用场景并不都提供对应的消息定义，应以 API 列表实际列出的条目为准。
- 官方模板含 `set_listen_address 1`、`set_network_discovery 1`，但 EX 脚本正文未列出这两条指令的参数定义；不要把模板中的 `1` 推广为完整枚举。

## 原文示例的格式与文字问题

转存保留原文；能通过 JSON 解析的示例标为 `json`，其余标为 `text`，避免暗示所有示例都可以直接作为 JSON 发送。

| 位置 | 原文问题 | 开发处理 |
| --- | --- | --- |
| API 结构 | `"data": some data` 是占位符 | 根据具体命令填写整数、对象或省略 `data` |
| `11000` 请求 | `0x000000`、`0xFFFFFF` 不属于合法 JSON 数字 | 在 TypeScript 对象中使用十六进制数值，再通过 `JSON.stringify` 序列化；JSON 中白色应为 `16777215` |
| `11000` 回应 | 带 `//点击的按钮序号` 注释 | 将注释与实际 JSON 分开处理 |
| `12010`、`12110`、`13000` 请求 | Windows 路径中的反斜杠未转义 | 用 `JSON.stringify` 处理路径，避免手工拼接 JSON |
| `13500` 请求 | `"type":0，` 使用全角逗号 | 序列化代码必须使用合法 JSON 标点 |
| `13400` 描述 | 原文写为“清除表情”，与标题、示例和坐标字段不一致 | 保留原文，按“设置位置”条目核对实际行为 |
| `14200` 描述 | 原文写为“移除指定ID的模型”，与标题和特效 ID 表不一致 | 保留原文，按“移除特效”条目核对实际行为 |

下面仅将 `13500` 原始示例的全角逗号改为半角逗号，得到可以解析的 JSON；这不是新增协议，也不代表已经验证服务端执行成功：

```json
{
  "msg": 13500,
  "msgId": 1,
  "data": {
    "id": 0,
    "channel": 0,
    "volume": 1,
    "delay": 0,
    "loop": false,
    "type": 0,
    "sound": "C:\\test.mp3"
  }
}
```

原始正文与整理备注应分别引用：涉及协议字段时以官方正文为来源，涉及示例格式修正时同时查看本页备注。
