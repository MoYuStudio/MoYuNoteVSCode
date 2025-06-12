# Power Text VSCode 插件

在编辑器中对文本进行额外支持的 VSCode 插件，用于在编辑器中显示新定义的.pwtt彩色文本，并支持导出为HTML 文件。

## ✨ 主要功能

- 🎨 支持16种预定义颜色
- ⚡ 实时更新文本颜色
- 📝 通过配置文件轻松修改设置
- 📤 一键导出为美观的 HTML 文件
- 🎯 支持在同一行中使用多个特殊符号
- 🔄 配置文件修改后自动生效

## 🛠️ 配置方法

### 方法一：使用左侧面板（推荐）

1. 点击 VSCode 左侧活动栏中的 Power Text 图标
2. 在配置视图中点击 "打开配置"
3. 配置文件将在新标签页中打开
4. 直接编辑配置文件
5. 保存后立即生效，无需重启 VSCode

### 方法二：使用命令面板

1. 在 VSCode 中按 `Ctrl+Shift+P`（Windows）或 `Cmd+Shift+P`（macOS）
2. 输入 "打开彩色文本配置文件"
3. 按回车，配置文件将在新标签页中打开
4. 直接编辑配置文件
5. 保存后立即生效，无需重启 VSCode

### 方法三：手动打开配置文件

配置文件 `config.json` 位于以下位置：

- Windows: `%USERPROFILE%\.vscode\extensions\power-text-vscode-0.0.1\config.json`
- macOS/Linux: `~/.vscode/extensions/power-text-vscode-0.0.1/config.json`

### 📋 配置文件格式

#### 1. 颜色配置文件 (config.json)

```json
{
    "replace": false,           // 是否启用替换功能
    "replace_symbol": "#",      // 替换符号
    "special_symbols": {
        "#-r": "#ff0000",    // 红色
        "#-g": "#00ff00",    // 绿色
        "#-b": "#0000ff",    // 蓝色
        "#-y": "#ffff00",    // 黄色
        "#-p": "#800080",    // 紫色
        "#-gr": "#808080",   // 灰色
        "#-w": "#ffffff",    // 白色
        "#-k": "#000000",    // 黑色
        "#-c": "#00ffff",    // 青色
        "#-m": "#ff00ff",    // 品红
        "#-o": "#ffa500",    // 橙色
        "#-br": "#a52a2a",   // 棕色
        "#-pk": "#ffc0cb",   // 粉色
        "#-lb": "#add8e6",   // 浅蓝
        "#-lg": "#90ee90",   // 浅绿
        "#-ly": "#ffffe0"    // 浅黄
    }
}
```

#### 2. 基础配置文件 (base_config.json)

```json
{
    "page": {
        "title": "MoYuStudio - PowerText",
        "font_family": "Consolas, 'Courier New', monospace",
        "font_size": "14px",
        "line_height": "0.9",
        "text_color": "#d4d4d4",
        "bg_color": "#1e1e1e",
        "max_width": "100%",
        "margin": "0 auto",
        "auto_line_break": true,
        "padding": {
            "top": "90px",
            "right": "120px",
            "bottom": "90px",
            "left": "120px"
        },
        "responsive": {
            "auto": {
                "enabled": true,
                "min_width": "320px",
                "max_width": "100%"
            }
        }
    },
    "title": {
        "font_weight": "normal",
        "color": "#d4d4d4",
        "font_size": "14px",
        "margin": "0",
        "padding": "0"
    },
    "item": {
        "margin": "0",
        "padding": "0 0 0 20px",
        "font_family": "Consolas, 'Courier New', monospace"
    },
    "print": {
        "enabled": true,
        "page_break": "avoid",
        "background": "white",
        "text_color": "black",
        "max_width": "100%",
        "padding": {
            "top": "0",
            "right": "0",
            "bottom": "0",
            "left": "0"
        }
    }
}
```

### 📋 高级配置说明

#### 页面设置 (page)

- `title`: 页面标题
- `font_family`: 字体设置
- `font_size`: 字体大小
- `line_height`: 行高
- `text_color`: 文本颜色
- `bg_color`: 背景颜色
- `max_width`: 最大宽度
- `margin`: 页面边距
- `auto_line_break`: 是否自动换行
- `padding`: 页面内边距
  - `top`: 上边距
  - `right`: 右边距
  - `bottom`: 下边距
  - `left`: 左边距
- `responsive`: 响应式设置
  - `auto`: 自动响应
    - `enabled`: 是否启用
    - `min_width`: 最小宽度
    - `max_width`: 最大宽度

#### 标题设置 (title)

- `font_weight`: 字体粗细
- `color`: 标题颜色
- `font_size`: 标题字体大小
- `margin`: 标题边距
- `padding`: 标题内边距

#### 列表项设置 (item)

- `margin`: 列表项边距
- `padding`: 列表项内边距
- `font_family`: 列表项字体

#### 打印设置 (print)

- `enabled`: 是否启用打印样式
- `page_break`: 分页设置
- `background`: 打印背景色
- `text_color`: 打印文本颜色
- `max_width`: 打印最大宽度
- `padding`: 打印内边距

### 🎨 颜色值格式

支持以下颜色格式：

- 十六进制颜色代码：`"#ff0000"`
- RGB 颜色值：`"rgb(255, 0, 0)"`
- 颜色名称：`"red"`

## 📤 导出 HTML

### 方法一：使用左侧面板（推荐）

1. 点击 VSCode 左侧活动栏中的 Power Text 图标
2. 在导出视图中点击 "导出为HTML"
3. HTML 文件将自动保存在源文件同目录下

### 方法二：使用命令面板

1. 在 VSCode 中按 `Ctrl+Shift+P`（Windows）或 `Cmd+Shift+P`（macOS）
2. 输入 "导出为HTML"
3. 按回车，HTML 文件将自动保存在源文件同目录下

## 📝 使用示例

```text
#-r 这是红色文本
#-g 这是绿色文本
#-b 这是蓝色文本
#-y 这是黄色文本
#-p 这是紫色文本
#-gr 这是灰色文本

# 同一行可以使用多个符号
#-y 这是黄色文本 #-r 这是红色文本
```

## ⚠️ 注意事项

- 配置文件修改后会自动生效
- 特殊符号区分大小写
- 建议使用有意义的符号组合，避免与代码冲突
- 如果配置文件损坏，插件会使用默认配置
- 导出的 HTML 文件会自动继承所有颜色设置
- HTML 文件使用响应式设计，支持移动设备查看

## 🎯 使用技巧

1. 使用 `#-r` 标记重要或警告信息
2. 使用 `#-g` 标记成功或完成的内容
3. 使用 `#-y` 标记需要注意的内容
4. 使用 `#-b` 标记说明或注释
5. 使用 `#-p` 标记特殊或强调的内容
6. 使用 `#-gr` 标记次要或辅助信息

## 🔄 更新日志

### v0.0.0

- 初始版本发布
- 支持16种预定义颜色
  - 红色 (#-r)
  - 绿色 (#-g)
  - 蓝色 (#-b)
  - 黄色 (#-y)
  - 紫色 (#-p)
  - 灰色 (#-gr)
  - 白色 (#-w)
  - 黑色 (#-k)
  - 青色 (#-c)
  - 品红 (#-m)
  - 橙色 (#-o)
  - 棕色 (#-br)
  - 粉色 (#-pk)
  - 浅蓝 (#-lb)
  - 浅绿 (#-lg)
  - 浅黄 (#-ly)
- 支持导出为 HTML 文件
- 添加配置文件编辑器
- 添加侧边栏快捷操作
- 支持自动换行配置
- 支持响应式布局
- 支持打印样式设置
- 支持特殊符号替换功能
  - 可配置是否启用替换
  - 可自定义替换符号

## 📞 反馈与支持

如果您在使用过程中遇到任何问题，或有任何建议，请随时提出。我们期待您的反馈！
