# API列表

> 来源：[https://live2d.pavostudio.com/doc/zh-cn/exapi/api-list/](https://live2d.pavostudio.com/doc/zh-cn/exapi/api-list/)
>
> 抓取日期：2026-10-11（北京时间）。以下为官方正文的 Markdown 转存，保留原始示例；有效 JSON 标为 `json`，其他示例标为 `text`。

<a id="10000"></a>

## \[10000\] 注册模型事件监听

<a id="_1"></a>

### 描述

```text
注册模型事件监听
```

<a id="_2"></a>

### 示例

```json
{
  "msg": 10000,
  "msgId": 1
}
```

<a id="_3"></a>

### 回应

```json
{
  "msg": 10000,
  "msgId": 1
}
```

---

<a id="10001"></a>

## \[10001\] 取消注册模型事件监听

<a id="_4"></a>

### 描述

```text
取消注册模型事件监听
```

<a id="_5"></a>

### 示例

```json
{
  "msg": 10001,
  "msgId": 1
}
```

---

<a id="10002"></a>

## \[10002\] 接收模型事件通知

<a id="_6"></a>

### 描述

```text
当模型触发事件时会向已注册的客户端发出消息通知
```

<a id="_7"></a>

### 回应

```json
{
  "msg": 10002,
  "msgId": 1,
  "data": {
    "type": 0,
    "id": 0,
    "modelId": "myModelId",
    "hitArea": "myHitArea"
  }
}
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| type | int | 事件类型 |
| id | int | 模型序号，从0开始，即模型#1的序号是0 |
| modelId | string | 模型ID，由模型制作者决定，可为空 |
| hitArea | string | 触发区域名，可为空 |

<a id="_8"></a>

### 事件列表

| 类型 | 描述 |
| --- | --- |
| 0 | 点击事件（Tap） |

---

<a id="11000"></a>

## \[11000\] 显示气泡文本

<a id="_9"></a>

### 描述

```text
指定的模型显示文本气泡
```

<a id="_10"></a>

### 示例

```text
{
  "msg": 11000,
  "msgId": 1,
  "data": {
    "id": 0,
    "text": "Hello this is control panel.",
    "choices": [
      "Open Baidu",
      "Open Google"
    ],
    "textFrameColor": 0x000000,
    "textColor": 0xFFFFFF,
    "duration": 3000
  }
}
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 模型序号，从0开始，即模型#1的序号是0 |
| text | string | 要显示的文本<br>支持的标签: [Rich Text](https://docs.unity3d.com/Manual/StyledText.html) |
| choices | array | 按钮选项 |
| textFrameColor | int | 文本框颜色，RGB整形值（如0xFFFFFF） |
| textColor | int | 文本颜色，RGB整形值（如0xFFFFFF） |
| duration | int | 显示时长，单位为毫秒<br>若设置为-1，气泡将不会自动消失 |

<a id="_11"></a>

### 回应

```text
{
  "msg": 11000,
  "msgId": 1,
  "data": 0 //点击的按钮序号
}
```

---

<a id="12010"></a>

## \[12010\] 设置背景

<a id="_12"></a>

### 描述

```text
设置普通背景
```

<a id="_13"></a>

### 示例

```text
{
  "msg": 12010,
  "msgId": 1,
  "data": {
    "id": 1,
    "file": "D:\Wallpaper\360background.png"
  }
}
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 显示器序号，从0开始，即显示器#1的序号是0 |
| file | string | 背景文件路径 |

<a id="_14"></a>

### 支持的格式

| 类型 | 格式 |
| --- | --- |
| Image | ".png", ".jpg", ".jpeg" |
| Video | ".mp4", ".mkv", ".mov", ".avi", ".webm", ".wmv" |
| Web | ".html", ".htm", ".xhtml" |

---

<a id="12110-360"></a>

## \[12110\] 设置360全景背景

<a id="_15"></a>

### 描述

```text
设置360全景背景
```

<a id="_16"></a>

### 示例

```text
{
  "msg": 12110,
  "msgId": 1,  
  "data": {
    "id": 1,
    "file": "D:\Wallpaper\360background.png"
  }
}
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 显示器序号，从0开始，即显示器#1的序号是0 |
| file | string | 背景文件路径 |

<a id="_17"></a>

### 支持的格式

| 类型 | 格式 |
| --- | --- |
| Image | ".png", ".jpg", ".jpeg" |
| Video | ".mp4", ".mkv", ".mov", ".avi", ".webm", ".wmv" |

---

<a id="13000"></a>

## \[13000\] 设置模型

<a id="_18"></a>

### 描述

```text
设置模型，目前仅支持json模型
```

<a id="_19"></a>

### 示例

```text
{
  "msg": 13000,
  "msgId": 1,
  "data": {
    "id": 1,
    "file": "D:\Unity Works\Sample\Kurumi\kurumi.model.json"
  }
}
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 模型序号，从0开始，即模型#1的序号是0 |
| file | string | \*.model.json文件路径 |

---

<a id="13100"></a>

## \[13100\] 移除模型

<a id="_20"></a>

### 描述

```text
移除模型
```

<a id="_21"></a>

### 示例

```json
{
  "msg": 13100,
  "msgId": 1,
  "data": 1
}
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| data | int | 模型序号，从0开始，即模型#1的序号是0 |

---

<a id="13200"></a>

## \[13200\] 触发动作

<a id="_22"></a>

### 描述

```text
触发动作
```

<a id="_23"></a>

### 示例

```json
{
  "msg": 13200,
  "msgId": 1,
  "data": {
    "id": 1,
    "type": 0,
    "mtn": "group:motion"
  }
}
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 模型序号，从0开始，即模型#1的序号是0 |
| type | int | 类型 |
| mtn | string | type值为0时，填写格式为 “group:motion”，例如 "tap:mtn1"<br>※ 不指定motion时请直接写group名即可，例如 "tap"<br><br>type值为1时，此处填写动作文件绝对路径，例如“C:\\mtn.motion3.json” |

---

<a id="13300"></a>

## \[13300\] 设置表情

<a id="_24"></a>

### 描述

```text
设置表情
```

<a id="_25"></a>

### 示例

```json
{
  "msg": 13300,
  "msgId": 1,
  "data": {
    "id": 1,
    "expId": 1
  }
}
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 模型序号，从0开始，即模型#1的序号是0 |
| expId | int | 表情ID |

---

<a id="13301"></a>

## \[13301\] 下一个表情

<a id="_26"></a>

### 描述

```text
下一个表情
```

<a id="_27"></a>

### 示例

```json
{
  "msg": 13301,
  "msgId": 1,
  "data": 0
}
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| data | int | 模型序号，从0开始，即模型#1的序号是0 |

---

<a id="13302"></a>

## \[13302\] 清除表情

<a id="_28"></a>

### 描述

```text
清除表情
```

<a id="_29"></a>

### 示例

```json
{
  "msg": 13302,
  "msgId": 1,
  "data": 0
}
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| data | int | 模型序号，从0开始，即模型#1的序号是0 |

---

<a id="13400"></a>

## \[13400\] 设置位置

<a id="_30"></a>

### 描述

```text
清除表情
```

<a id="_31"></a>

### 示例

```json
{
  "msg": 13400,
  "msgId": 1,
  "data": {
    "id": 0,
    "posX": 200,
    "posY": 300
  }
}
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 模型序号，从0开始，即模型#1的序号是0 |
| posX | int | 屏幕像素点横坐标（屏幕左下角为原点） |
| posY | int | 屏幕像素点纵坐标（屏幕左下角为原点） |

---

<a id="13500"></a>

## \[13500\] 播放声音

<a id="_32"></a>

### 描述

```text
播放声音。支持格式MP3、OGG、WAV。
```

<a id="_33"></a>

### 示例

```text
{
  "msg": 13500,
  "msgId": 1,
  "data": {
    "id": 0,
    "channel":0,
    "volume":1,
    "delay":0,
    "loop":false,
    "type":0，
    "sound":"C:\\test.mp3"
  }
}
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 模型序号，从0开始，即模型#1的序号是0 |
| channel | int | 声音频道，可选择0、1、2 |
| volume | float | 音量，范围0-1 |
| delay | int | 延迟播放，单位为毫秒（ms） |
| loop | bool | 是否循环播放，可选择true或false |
| type | int | 数据类型 |
| sound | string | type值为0时，填写文件绝对路径<br><br>type值为1时，此处填写声音二进制数据的Base64字符串 |

> **提示**
>
> - 切换模型会停止所有频道的音频
> - 模型默认使用频道0进行语音播放，触发语音时会中断频道0当前播放的音频。若希望循环播放背景音乐，建议将频道设为1或2
> - 使用sound字段传递二进制数据时，为减少数据量，推荐MP3或OGG

---

<a id="13501"></a>

## \[13501\] 停止声音

<a id="_34"></a>

### 描述

```text
停止声音
```

<a id="_35"></a>

### 示例

```json
{
  "msg": 13501,
  "msgId": 1,
  "data": {
    "id": 0,
    "channel":0
  }
}
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 模型序号，从0开始，即模型#1的序号是0 |
| channel | int | 声音频道，可选择0，1，2 |

---

<a id="14000"></a>

## \[14000\] 设置特效

<a id="_36"></a>

### 描述

```text
设置特效并移除其他特效
```

<a id="_37"></a>

### 示例

```json
{
  "msg": 14000,
  "msgId": 1,
  "data": 100100
}
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| data | int | 特效ID， 详见ID列表 |

<a id="id-list"></a>

### ID List

| ID | 描述 |
| --- | --- |
| 100100 | 雨 |
| 100110 | 雪 |

---

<a id="14100"></a>

## \[14100\] 添加特效

<a id="_38"></a>

### 描述

```text
添加特效
```

<a id="_39"></a>

### 示例

```json
{
  "msg": 14100,
  "msgId": 1,
  "data": 100100
}
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| data | int | 特效ID， 详见ID列表 |

---

<a id="14200"></a>

## \[14200\] 移除特效

<a id="_40"></a>

### 描述

```text
移除指定ID的模型，设置为-1来移除所有特效
```

<a id="_41"></a>

### 示例

```json
{
  "msg": 14200,
  "msgId": 1,
  "data": 100100
}
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| data | int | 特效ID， 详见ID列表 |
