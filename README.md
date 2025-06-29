# MoYuNote VSCode

MoYuNote 是一个轻量化的文本编辑器扩展，通过简单的符号标记，支持彩色文本、自动大纲、括号彩色化等功能，并轻松导出为 HTML 文件分享给他人。

![快速入门](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/Wilso/Documents/GitHub/PowerTextVSCode/image.png)

## ✨ 核心特点

- 🚀 轻量级
- ⚡ 简单高效：使用简单的符号即可实现丰富的样式
- 🎨 样式丰富：支持颜色、字体、背景等多种样式
- 📤 一键分享：轻松导出为相同观感的 HTML 文件
- 📑 智能大纲：自动识别文档结构，支持折叠展开
- 🔄 实时预览：编辑器窗口与展示观感相同

## 🎯 快速开始

### 方法一：使用快速入门文件（推荐）

1. 点击 VSCode 左侧活动栏中的 MoYu Note 图标
2. 在信息视图中点击 "创建快速入门文件"
3. 快速入门文件将自动创建并打开，包含所有功能示例和说明
4. 按照文件中的示例开始使用

### 方法二：手动开始

1. 在文本前添加样式符号，如 `#-r` 表示红色文本
2. 样式立即生效，所见即所得
3. 点击导出按钮，生成 HTML 文件
4. 分享 HTML 文件给他人，保持样式效果

## 🛠️ 配置方法

### 方法一：使用左侧面板（推荐）

1. 点击 VSCode 左侧活动栏中的 MoYu Note 图标
2. 在配置视图中点击 "打开配置"
3. 直接编辑配置文件，保存后立即生效

### 方法二：使用命令面板

1. 按 `Ctrl+Shift+P`（Windows）或 `Cmd+Shift+P`（macOS）
2. 输入 "打开彩色文本配置文件"
3. 编辑配置文件，保存后立即生效

## 📋 配置文件

```json
{
    "special_symbols": {
        "styles": {
            "#-r": {
                "color": "#ff0000",           // 文本颜色
                "fontWeight": "bold",         // 字体粗细
                "fontStyle": "normal",        // 字体样式
                "fontFamily": "Consolas",     // 字体
                "backgroundColor": "#333333", // 背景色
                "textDecoration": "underline",// 文本装饰
                "textShadow": "0 0 5px",      // 文字阴影
                "border": "1px solid",        // 边框
                "borderRadius": "3px"         // 圆角
            }
        }
    }
}
```

## 📝 使用示例

```text
#-r 这是红色文本
#-g 这是绿色文本
#-b 这是蓝色文本

# 同一行可以使用多个符号
#-y 这是黄色文本 #-r 这是红色文本
```

## 🎯 使用技巧

1. 使用简单的符号组合创建独特样式
2. 利用大纲功能组织长文档
3. 导出 HTML 文件分享给他人
4. 自定义样式满足个性化需求
