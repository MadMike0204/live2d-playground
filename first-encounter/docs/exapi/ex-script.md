# EX脚本

> 来源：[https://live2d.pavostudio.com/doc/zh-cn/exapi/ex-script/](https://live2d.pavostudio.com/doc/zh-cn/exapi/ex-script/)
>
> 抓取日期：2026-10-11（北京时间）。以下为官方正文的 Markdown 转存，保留原始示例；有效 JSON 标为 `json`，其他示例标为 `text`。

<a id="ex"></a>

### 关于EX脚本

EX脚本用于对Live2DViewerEX进行配置相关的操作，代替用户操作

> **执行脚本**
>
> ■ Windows：托盘图标右键 -> 运行<br>■ MacOS: 状态栏图标左键 -> 运行脚本

<a id="_1"></a>

### 示例

```text
#EX Script
command
command
...
```

脚本模板： [template.txt](https://live2d.pavostudio.com/sample/template.txt)

|  |  |
| --- | --- |
| #EX Script | 脚本头，此字段为固定值 |
| command | 指令行 |

> **注意**
>
> 所有路径和名称中若存在空格，需在空格前加反斜杠（\\）

---

<a id="lpk"></a>

### 添加LPK文件

> add\_lpk\_model \[path\]

```text
add_lpk_model model.lpk
```

|  |  |
| --- | --- |
| path | 文件相对路径，根目录为脚本所在文件夹 |

---

<a id="lpk_1"></a>

### 加载LPK模型

> load\_lpk\_model \[slot\] \[lpk\] \[char\] \[cos\]

```text
load_lpk_model 1 lpk char cos
```

|  |  |
| --- | --- |
| slot | 插槽序号，1~8 |
| lpk | lpk文件名，不包含文件后缀 |
| char | 角色名 |
| cos | 服装名 |

> **提示**
>
> 若存在多个符合条件的模型，仅加载第一个找到的

---

<a id="lpk_2"></a>

### 编辑LPK模型

> edit\_lpk\_model \[lpk\] \[char\] \[cos\] \[type\] \[item\] \[sp\_key\] \[key\]

```text
edit_lpk_model lpk char cos 1 Tap:Mtn 3 A
```

|  |  |
| --- | --- |
| lpk | lpk文件名，不包含文件后缀 |
| char | 角色名 |
| cos | 服装名 |
| type | 编辑类型：<br>■ 1：按键绑定 - 事件<br>■ 2：按键绑定 - 动作<br>■ 3：按键绑定 - 表情 |
| item | 要绑定的项目名 |
| sp\_key | 组合键：<br>■ 0：无<br>■ 1：ctrl<br>■ 2：shift<br>■ 3：ctrl + shift |
| key | 热键。支持 A-Z 和 0-9，其中字母必须大写 |

> **提示**
>
> 若存在多个符合条件的模型，仅编辑第一个找到的

---

<a id="_2"></a>

### 设置模型位置

> set\_model\_position \[slot\] \[x\] \[y\]

```text
set_model_position 1 50 100
```

|  |  |
| --- | --- |
| slot | 插槽序号，1~8 |
| x | 相对于屏幕中心的X轴位置 |
| y | 相对于屏幕中心的Y轴位置 |

---

<a id="_3"></a>

### 设置模型大小

> set\_model\_size \[slot\] \[size\]

```text
set_model_size 1 1.5
```

|  |  |
| --- | --- |
| slot | 插槽序号，1~8 |
| size | 模型大小 |

---

<a id="_4"></a>

### 设置模型角度

> set\_model\_angle \[slot\] \[angle\]

```text
set_model_angle 1 90
```

|  |  |
| --- | --- |
| slot | 插槽序号，1~8 |
| angle | 角度 |

---

<a id="_5"></a>

### 设置模型镜像

> set\_model\_mirror \[slot\] \[on\]

```text
set_model_mirror 1 1
```

|  |  |
| --- | --- |
| slot | 插槽序号，1~8 |
| on | ■ 0：关闭<br>■ 1：打开 |

---

<a id="_6"></a>

### 启用热键

> set\_hotkey\_enable \[enable\]

```text
set_hotkey_enable 2
```

|  |  |
| --- | --- |
| enable | ■ 0：禁用<br>■ 1：仅在桌面启用<br>■ 2：总是启用 |

---

<a id="_7"></a>

### 显示悬浮图标

> set\_floating\_icon \[show\]

```text
set_floating_icon 1
```

|  |  |
| --- | --- |
| show | ■ 0：不显示<br>■ 1：显示 |

---

<a id="_8"></a>

### 设置启动模式

> set\_launch\_mode \[mode\]

```text
set_launch_mode 1
```

|  |  |
| --- | --- |
| mode | ■ 0：壁纸模式<br>■ 1：桌面模式 |

---

<a id="_9"></a>

### 设置总是显示在最前面

> set\_always\_on\_top \[on\]

```text
set_always_on_top 1
```

|  |  |
| --- | --- |
| on | ■ 0：关闭<br>■ 1：打开 |

> **提示**
>
> 仅在桌面模式下有效

---

<a id="_10"></a>

### 设置显示类型

> set\_display\_type \[type\]

```text
set_display_type 1
```

|  |  |
| --- | --- |
| type | ■ 0：全屏<br>■ 1：工作区<br>■ 2：窗口 |

> **提示**
>
> 仅在桌面模式下有效

---

<a id="_11"></a>

### 设置窗口尺寸

> set\_window\_size \[width\] \[height\]

```text
set_window_size 960 720
```

|  |  |
| --- | --- |
| width | 宽度 |
| height | 高度 |

> **提示**
>
> 仅在桌面窗口模式下有效

---

<a id="obswindows"></a>

### 启用OBS兼容（Windows）

> set\_obs\_compat \[enable\]

```text
set_obs_compat 1
```

|  |  |
| --- | --- |
| enable | ■ 0：禁用<br>■ 1：启用 |

---

<a id="windows"></a>

### 设置滤镜关键色（Windows）

> set\_filter\_color \[color\]

```text
set_filter_color FF00FF
```

|  |  |
| --- | --- |
| color | 十六进制RGB值，例如：FF00FF |

---

<a id="windows_1"></a>

### 启用虚拟摄像头（Windows）

> set\_virtual\_camera \[enable\]

```text
set_virtual_camera 1
```

|  |  |
| --- | --- |
| enable | ■ 0：禁用<br>■ 1：启用 |

> **提示**
>
> 此设定在每次重启应用会重置，请勿和需要重启应用的脚本同时使用

---

<a id="windows_2"></a>

### 安装虚拟摄像头（Windows）

> install\_virtual\_camera

```text
install_virtual_camera
```

---

<a id="windows_3"></a>

### 卸载虚拟摄像头（Windows）

> uninstall\_virtual\_camera

```text
uninstall_virtual_camera
```

---

<a id="_12"></a>

### 当其他应用全屏时

> set\_other\_app\_fullscreen \[method\]

```text
set_other_app_fullscreen 1
```

|  |  |
| --- | --- |
| method | ■ 0：保持运行<br>■ 1：暂停<br>■ 2：静音 |

---

<a id="_13"></a>

### 当其他应用最大化时

> set\_other\_app\_maximized \[method\]

```text
set_other_app_maximized 1
```

|  |  |
| --- | --- |
| method | ■ 0：保持运行<br>■ 1：暂停<br>■ 2：静音 |

---

## 附录：官方脚本模板

来源：[template.txt](https://live2d.pavostudio.com/sample/template.txt)，抓取日期：2026-10-11。以下保留模板原文，未执行其中命令。

```text
#EX Script

#添加lpk模型
add_lpk_model inu.lpk

#编辑lpk模型：按键绑定-事件
edit_lpk_model inu inu cos 1 action@01_Nod#1 0 Q
edit_lpk_model inu inu cos 1 action@02_Clapping#1 0 W
edit_lpk_model inu inu cos 1 action@03_ShakeHead#1 0 E
edit_lpk_model inu inu cos 1 action@04_Worry#1 0 R
edit_lpk_model inu inu cos 1 action@05_Laugh#1 0 T
edit_lpk_model inu inu cos 1 pose@ParamEmotions8#9 0 Z
edit_lpk_model inu inu cos 1 pose@ParamEmotions9#9 0 X
edit_lpk_model inu inu cos 1 pose@ParamEmotions10#9 0 C
edit_lpk_model inu inu cos 1 pose@ParamEmotions11#9 0 V

#设置热键为总是启用
set_hotkey_enable 2

#设置启动模式为：桌面模式
set_launch_mode 1

#设置桌面模式为：窗口
set_display_type 2

#设置监听地址为：任意
set_listen_address 1

#设置窗口尺寸
set_window_size 960 720

#启用网络发现
set_network_discovery 1

#隐藏悬浮图标
set_floating_icon 0

#启用OBS兼容（可选）
set_obs_compat 1

#禁用总是显示在最前
set_always_on_top 0

#启用虚拟摄像头（可选）
#set_virtual_camera 1

#安装虚拟摄像头（可选）
#install_virtual_camera
```
