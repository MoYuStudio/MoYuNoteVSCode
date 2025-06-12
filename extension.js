const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * 转义正则表达式特殊字符
 * @param {string} string - 需要转义的字符串
 * @returns {string} - 转义后的字符串
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 加载彩色文本配置文件
 * @returns {Object} - 配置对象，包含特殊符号及其颜色
 */
function loadConfig() {
    try {
        const configPath = path.join(__dirname, 'config.json');
        const configContent = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configContent);
    } catch (error) {
        console.error('无法加载配置文件:', error);
        return {
            replace: true,
            replace_symbol: "",
            auto_line_break: true,
            special_symbols: {
                "#-r": "#ff0000",
                "#-g": "#00ff00",
                "#-b": "#0000ff",
                "#-y": "#ffff00",
                "#-p": "#800080",
                "#-gr": "#808080",
                "#-w": "#ffffff",
                "#-k": "#000000",
                "#-c": "#00ffff",
                "#-m": "#ff00ff",
                "#-o": "#ffa500",
                "#-br": "#a52a2a",
                "#-pk": "#ffc0cb",
                "#-lb": "#add8e6",
                "#-lg": "#90ee90",
                "#-ly": "#ffffe0"
            }
        };
    }
}

/**
 * 加载基础配置文件
 * @returns {Object} - 基础配置对象，包含页面样式设置
 */
function loadBaseConfig() {
    try {
        const baseConfigPath = path.join(__dirname, 'base_config.json');
        const baseConfigContent = fs.readFileSync(baseConfigPath, 'utf8');
        return JSON.parse(baseConfigContent);
    } catch (error) {
        console.error('无法加载基础配置文件:', error);
        return {
            page: {
                title: "MoYuStudio - PowerText",
                font_family: "Consolas, 'Courier New', monospace",
                font_size: "14px",
                line_height: "0.9",
                text_color: "#d4d4d4",
                bg_color: "#1e1e1e",
                max_width: "100%",
                margin: "0 auto",
                padding: {
                    top: "90px",
                    right: "120px",
                    bottom: "90px",
                    left: "120px"
                },
                responsive: {
                    auto: {
                        enabled: true,
                        min_width: "320px",
                        max_width: "100%"
                    }
                }
            },
            title: {
                font_weight: "normal",
                color: "#d4d4d4",
                font_size: "14px",
                margin: "0",
                padding: "0"
            },
            item: {
                margin: "0",
                padding: "0 0 0 20px",
                font_family: "Consolas, 'Courier New', monospace"
            },
            print: {
                enabled: true,
                page_break: "avoid",
                background: "white",
                text_color: "black",
                max_width: "100%",
                padding: {
                    top: "0",
                    right: "0",
                    bottom: "0",
                    left: "0"
                }
            }
        };
    }
}

/**
 * 将文本转换为HTML格式
 * @param {string} text - 原始文本内容
 * @param {Object} config - 彩色文本配置
 * @param {Object} baseConfig - 基础样式配置
 * @returns {string} - 生成的HTML内容
 */
function textToHtml(text, config, baseConfig) {
    const lines = text.split('\n');
    let htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${baseConfig.page.title}</title>
    <style>
        /* CSS变量定义 */
        :root {
            --text-color: ${baseConfig.page.text_color};
            --bg-color: ${baseConfig.page.bg_color};
            --link-color: #0066cc;
            ${Object.entries(config.special_symbols).map(([symbol, color], index) => 
                `--symbol-${index + 1}-color: ${color};`
            ).join('\n            ')}
        }
        
        /* 页面主体样式 */
        body { 
            font-family: ${baseConfig.page.font_family};
            font-size: ${baseConfig.page.font_size};
            margin: ${baseConfig.page.margin};
            padding: ${baseConfig.page.padding.top} ${baseConfig.page.padding.right} ${baseConfig.page.padding.bottom} ${baseConfig.page.padding.left};
            color: var(--text-color);
            background-color: var(--bg-color);
            line-height: ${baseConfig.page.line_height};
            width: min(${baseConfig.page.responsive.auto.max_width}, 100%);
            min-width: ${baseConfig.page.responsive.auto.min_width};
            box-sizing: border-box;
            white-space: ${config.auto_line_break ? 'pre-wrap' : 'pre'};
            overflow-x: ${config.auto_line_break ? 'visible' : 'auto'};
            word-break: ${config.auto_line_break ? 'break-all' : 'normal'};
            word-wrap: ${config.auto_line_break ? 'break-word' : 'normal'};
        }
        
        /* 列表项样式 */
        .item { 
            margin: ${baseConfig.item.margin};
            padding: ${baseConfig.item.padding};
            font-family: ${baseConfig.item.font_family};
            white-space: ${config.auto_line_break ? 'pre-wrap' : 'pre'};
            line-height: ${baseConfig.page.line_height};
            word-break: ${config.auto_line_break ? 'break-all' : 'normal'};
            word-wrap: ${config.auto_line_break ? 'break-word' : 'normal'};
        }
        
        /* 注释样式 */
        .comment { 
            color: #666666;
            font-style: normal;
        }
        
        /* 特殊符号样式 */
        ${Object.entries(config.special_symbols).map(([symbol, color], index) => 
            `.symbol-${index + 1} { color: var(--symbol-${index + 1}-color); }`
        ).join('\n        ')}
        
        /* 打印样式 */
        @media print {
            body {
                background: ${baseConfig.print.background};
                color: ${baseConfig.print.text_color};
                max-width: ${baseConfig.print.max_width};
                padding: ${baseConfig.print.padding.top} ${baseConfig.print.padding.right} ${baseConfig.print.padding.bottom} ${baseConfig.print.padding.left};
            }
            
            .item {
                page-break-inside: ${baseConfig.print.page_break};
            }
        }
    </style>
</head>
<body>
`;

    lines.forEach(line => {
        // 保留原始空白字符
        if (line === '') {
            htmlContent += '\n';
            return;
        }

        let processedLine = line;
        // 先处理最长的符号，避免部分匹配
        const sortedSymbols = Object.keys(config.special_symbols).sort((a, b) => b.length - a.length);
        
        // 查找所有符号的位置
        const symbolPositions = [];
        for (const symbol of sortedSymbols) {
            let pos = 0;
            while ((pos = processedLine.indexOf(symbol, pos)) !== -1) {
                // 检查是否已经被其他符号匹配
                const isOverlapping = symbolPositions.some(sp => 
                    (pos >= sp.position && pos < sp.position + sp.length) ||
                    (sp.position >= pos && sp.position < pos + symbol.length)
                );
                
                if (!isOverlapping) {
                    const symbolIndex = Object.keys(config.special_symbols).indexOf(symbol) + 1;
                    symbolPositions.push({
                        symbol,
                        position: pos,
                        length: symbol.length,
                        color: config.special_symbols[symbol],
                        className: `symbol-${symbolIndex}`
                    });
                }
                pos += symbol.length;
            }
        }
        
        // 按位置排序
        symbolPositions.sort((a, b) => a.position - b.position);
        
        // 从后向前处理，避免位置偏移
        let lastPosition = processedLine.length;
        for (let i = symbolPositions.length - 1; i >= 0; i--) {
            const { symbol, position, length, className } = symbolPositions[i];
            const textToColor = processedLine.substring(position, lastPosition);
            if (textToColor) {  // 只处理非空文本
                // 如果启用了替换功能，将特殊符号替换为指定字符
                const displaySymbol = config.replace ? config.replace_symbol : symbol;
                const remainingText = textToColor.substring(length);
                processedLine = processedLine.substring(0, position) + 
                              `<span class="${className}" style="display: inline${config.auto_line_break ? '' : '; white-space: nowrap'}">${displaySymbol}${remainingText}</span>` + 
                              processedLine.substring(lastPosition);
            }
            lastPosition = position;
        }

        // 移除行尾的换行符
        processedLine = processedLine.replace(/\n$/, '');

        // 所有行都使用 item 类
        htmlContent += `<div class="item" style="white-space: ${config.auto_line_break ? 'pre-wrap' : 'pre'}; display: block;">${processedLine}</div>\n`;
    });

    htmlContent += `</body>
</html>`;

    return htmlContent;
}

/**
 * 导出树形视图提供者类
 * 用于在侧边栏显示导出选项
 */
class ExportTreeProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    /**
     * 刷新树形视图
     */
    refresh() {
        this._onDidChangeTreeData.fire();
    }

    /**
     * 获取树形项目
     * @param {any} element - 树形项目元素
     * @returns {any} - 返回树形项目
     */
    getTreeItem(element) {
        return element;
    }

    /**
     * 获取子项目
     * @returns {Array} - 返回空数组，不显示任何树形项目
     */
    getChildren() {
        // 返回空数组，这样就不会显示任何树形项目
        return [];
    }
}

/**
 * 激活扩展
 * @param {vscode.ExtensionContext} context - 扩展上下文
 */
function activate(context) {
    let config = loadConfig();
    let baseConfig = loadBaseConfig();
    let decorations = new Map();
    let exportTreeProvider = new ExportTreeProvider();

    /**
     * 创建装饰器类型
     * 为每个特殊符号创建对应的装饰器
     */
    function createDecorations() {
        decorations.clear();
        for (const [symbol, color] of Object.entries(config.special_symbols)) {
            decorations.set(symbol, vscode.window.createTextEditorDecorationType({
                color: color,
                rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
                isWholeLine: false,
                after: {
                    color: color
                }
            }));
        }
    }

    // 初始化装饰器
    createDecorations();

    /**
     * 更新装饰器
     * 根据当前文档内容更新特殊符号的装饰效果
     */
    function updateDecorations() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        // 检查文件类型是否为.pwtt
        if (!editor.document.fileName.endsWith('.pwtt')) {
            // 清除所有装饰器
            for (const decoration of decorations.values()) {
                editor.setDecorations(decoration, []);
            }
            return;
        }

        const text = editor.document.getText();
        const ranges = new Map();
        
        // 为每个符号初始化范围数组
        for (const symbol of Object.keys(config.special_symbols)) {
            ranges.set(symbol, []);
        }

        // 查找所有特殊符号
        for (const [symbol, color] of Object.entries(config.special_symbols)) {
            const regex = new RegExp(escapeRegExp(symbol), 'g');
            let match;
            while ((match = regex.exec(text)) !== null) {
                const startPos = editor.document.positionAt(match.index);
                // 找到下一个符号或行尾的位置
                let endIndex = text.indexOf('\n', match.index);
                if (endIndex === -1) endIndex = text.length;
                
                // 检查是否有其他符号在当前符号之后
                for (const otherSymbol of Object.keys(config.special_symbols)) {
                    if (otherSymbol !== symbol) {
                        const nextSymbolIndex = text.indexOf(otherSymbol, match.index + symbol.length);
                        if (nextSymbolIndex !== -1 && nextSymbolIndex < endIndex) {
                            endIndex = nextSymbolIndex;
                        }
                    }
                }
                
                const endPos = editor.document.positionAt(endIndex);
                ranges.get(symbol).push(new vscode.Range(startPos, endPos));
            }
        }

        // 应用装饰器
        for (const [symbol, decoration] of decorations.entries()) {
            editor.setDecorations(decoration, ranges.get(symbol));
        }
    }

    // 注册命令
    const commands = [
        vscode.commands.registerCommand('power-text.activate', () => {
            config = loadConfig();
            baseConfig = loadBaseConfig();
            createDecorations();
            updateDecorations();
        }),
        vscode.commands.registerCommand('power-text.openConfig', async () => {
            const configPath = path.join(__dirname, 'config.json');
            try {
                const doc = await vscode.workspace.openTextDocument(configPath);
                await vscode.window.showTextDocument(doc);
            } catch (error) {
                vscode.window.showErrorMessage('无法打开配置文件：' + error.message);
            }
        }),
        vscode.commands.registerCommand('power-text.openBaseConfig', async () => {
            const baseConfigPath = path.join(__dirname, 'base_config.json');
            try {
                const doc = await vscode.workspace.openTextDocument(baseConfigPath);
                await vscode.window.showTextDocument(doc);
            } catch (error) {
                vscode.window.showErrorMessage('无法打开基础配置文件：' + error.message);
            }
        }),
        vscode.commands.registerCommand('power-text.exportHtml', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('没有打开的编辑器');
                return;
            }

            // 重新加载配置以确保使用最新设置
            config = loadConfig();
            baseConfig = loadBaseConfig();

            const text = editor.document.getText();
            const htmlContent = textToHtml(text, config, baseConfig);

            // 获取当前文件路径
            const currentFilePath = editor.document.uri.fsPath;
            const currentDir = path.dirname(currentFilePath);
            const currentFileName = path.basename(currentFilePath, path.extname(currentFilePath));
            const outputPath = path.join(currentDir, `${currentFileName}.html`);

            try {
                fs.writeFileSync(outputPath, htmlContent, 'utf8');
                vscode.window.showInformationMessage(`HTML文件已保存到：${outputPath}`);
            } catch (error) {
                vscode.window.showErrorMessage('导出失败：' + error.message);
            }
        }),
        vscode.commands.registerCommand('power-text.exportHtmlWithPicker', async () => {
            // 重新加载配置以确保使用最新设置
            config = loadConfig();
            baseConfig = loadBaseConfig();

            // 打开文件选择器
            const fileUris = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                openLabel: '选择要导出的文件',
                filters: {
                    'Text Files': ['*', 'txt', 'ini']
                }
            });

            if (!fileUris || fileUris.length === 0) {
                return;
            }

            const fileUri = fileUris[0];
            try {
                // 读取文件内容
                const fileContent = await vscode.workspace.fs.readFile(fileUri);
                const text = Buffer.from(fileContent).toString('utf8');
                const htmlContent = textToHtml(text, config, baseConfig);

                // 获取输出路径
                const currentDir = path.dirname(fileUri.fsPath);
                const currentFileName = path.basename(fileUri.fsPath, path.extname(fileUri.fsPath));
                const outputPath = path.join(currentDir, `${currentFileName}.html`);

                // 保存HTML文件
                fs.writeFileSync(outputPath, htmlContent, 'utf8');
                vscode.window.showInformationMessage(`HTML文件已保存到：${outputPath}`);
            } catch (error) {
                vscode.window.showErrorMessage('导出失败：' + error.message);
            }
        })
    ];

    // 注册树视图
    const treeView = vscode.window.createTreeView('power-text-symbols', {
        treeDataProvider: exportTreeProvider
    });

    // 监听文档变化
    vscode.workspace.onDidChangeTextDocument(event => {
        updateDecorations();
    });

    // 监听编辑器切换
    vscode.window.onDidChangeActiveTextEditor(() => {
        updateDecorations();
    });

    // 监听配置文件变化
    const configWatcher = vscode.workspace.createFileSystemWatcher('**/config.json');
    configWatcher.onDidChange(() => {
        config = loadConfig();
        createDecorations();
        updateDecorations();
    });

    // 监听基础配置文件变化
    const baseConfigWatcher = vscode.workspace.createFileSystemWatcher('**/base_config.json');
    baseConfigWatcher.onDidChange(() => {
        baseConfig = loadBaseConfig();
        // 如果当前有打开的编辑器，更新装饰器
        if (vscode.window.activeTextEditor) {
            updateDecorations();
        }
    });

    // 初始更新
    updateDecorations();

    // 注册所有命令和监听器
    context.subscriptions.push(
        ...commands,
        configWatcher,
        baseConfigWatcher,
        treeView
    );
}

/**
 * 停用扩展
 */
function deactivate() {}

module.exports = {
    activate,
    deactivate
} 