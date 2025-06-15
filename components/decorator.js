const vscode = require('vscode');
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
 * 装饰器管理类
 */
class DecoratorManager {
    constructor() {
        this.decorations = new Map();
        this.outlineRanges = new Map();
        this.outlineLevels = new Map();
        this.defaultTextStyle = {
            color: "#d4d4d4",
            fontWeight: "normal",
            fontStyle: "normal",
            fontFamily: "Consolas, 'Courier New', monospace",
            backgroundColor: "transparent",
            textDecoration: "none",
            textShadow: "none",
            border: "none",
            borderRadius: "0"
        };
        this.bracketPairs = [
            ['(', ')'],
            ['[', ']'],
            ['{', '}'],
            ['（', '）'],
            ['［', '］'],
            ['｛', '｝']
        ];
    }

    /**
     * 检查文件类型是否支持
     * @param {string} fileName - 文件名
     * @param {Object} config - 配置对象
     * @returns {boolean} - 是否支持该文件类型
     */
    isFileTypeSupported(fileName, config) {
        if (!config.file_types || !config.file_types.enabled) {
            return true; // 如果未配置文件类型支持，则默认支持所有类型
        }

        const fileExt = path.extname(fileName).toLowerCase();
        const supportedTypes = config.file_types.supported_types;
        
        // 检查无后缀名文件
        if (fileExt === '' && !fileName.includes('.')) {
            return supportedTypes[''] === true;
        }
        
        return supportedTypes[fileExt] === true;
    }

    /**
     * 获取文件类型特定的样式
     * @param {string} fileName - 文件名
     * @param {Object} config - 配置对象
     * @returns {Object} - 样式对象
     */
    getFileTypeStyle(fileName, config) {
        if (!config.file_types || !config.file_types.enabled) {
            return config.default_text;
        }

        const fileExt = path.extname(fileName).toLowerCase();
        const typeStyles = config.file_types.type_specific_styles;
        
        if (typeStyles && typeStyles[fileExt]) {
            return { ...config.file_types.default_style, ...typeStyles[fileExt] };
        }
        
        return config.file_types.default_style;
    }

    /**
     * 创建装饰器类型
     * 为每个特殊符号创建对应的装饰器
     * @param {Object} config - 配置对象
     */
    createDecorations(config) {
        this.decorations.clear();
        this.outlineRanges.clear();
        this.outlineLevels.clear();
        
        // 设置默认文本样式
        if (config.default_text) {
            this.defaultTextStyle = {
                ...this.defaultTextStyle,
                ...config.default_text
            };
        }

        // 处理样式装饰器
        for (const [symbol, style] of Object.entries(config.special_symbols.styles)) {
            // 创建装饰器配置
            const decorationOptions = {
                rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
                isWholeLine: false,
                color: style.color || this.defaultTextStyle.color,
                backgroundColor: style.backgroundColor || this.defaultTextStyle.backgroundColor,
                fontWeight: style.fontWeight || this.defaultTextStyle.fontWeight,
                fontStyle: style.fontStyle || this.defaultTextStyle.fontStyle,
                textDecoration: style.textDecoration || this.defaultTextStyle.textDecoration,
                fontFamily: style.fontFamily || this.defaultTextStyle.fontFamily,
                textShadow: style.textShadow || this.defaultTextStyle.textShadow,
                border: style.border || this.defaultTextStyle.border,
                borderRadius: style.borderRadius || this.defaultTextStyle.borderRadius,
                after: {
                    contentText: ' ',
                    color: style.color || this.defaultTextStyle.color,
                    backgroundColor: style.backgroundColor || this.defaultTextStyle.backgroundColor,
                    fontWeight: style.fontWeight || this.defaultTextStyle.fontWeight,
                    fontStyle: style.fontStyle || this.defaultTextStyle.fontStyle,
                    textDecoration: style.textDecoration || this.defaultTextStyle.textDecoration,
                    fontFamily: style.fontFamily || this.defaultTextStyle.fontFamily,
                    textShadow: style.textShadow || this.defaultTextStyle.textShadow,
                    border: style.border || this.defaultTextStyle.border,
                    borderRadius: style.borderRadius || this.defaultTextStyle.borderRadius,
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    zIndex: '1'
                }
            };

            // 创建装饰器
            this.decorations.set(symbol, vscode.window.createTextEditorDecorationType(decorationOptions));
        }

        // 创建括号装饰器
        if (config.bracket_colors && config.bracket_colors.length > 0) {
            for (let i = 0; i < config.bracket_colors.length; i++) {
                const color = config.bracket_colors[i];
                const decorationOptions = {
                    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
                    isWholeLine: false,
                    color: color
                };
                this.decorations.set(`bracket_${i}`, vscode.window.createTextEditorDecorationType(decorationOptions));
            }
        }

        // 创建大纲装饰器
        const outlineDecoration = vscode.window.createTextEditorDecorationType({
            cursor: 'pointer'
        });
        this.decorations.set('outline', outlineDecoration);
    }

    /**
     * 更新装饰器
     * 根据当前文档内容更新特殊符号的装饰效果
     * @param {Object} config - 配置对象
     */
    updateDecorations(config) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        // 检查文件类型是否支持
        if (!this.isFileTypeSupported(editor.document.fileName, config)) {
            // 清除所有装饰器
            for (const decoration of this.decorations.values()) {
                editor.setDecorations(decoration, []);
            }
            return;
        }

        // 获取文件类型特定的样式
        const fileStyle = this.getFileTypeStyle(editor.document.fileName, config);
        this.defaultTextStyle = {
            ...this.defaultTextStyle,
            ...fileStyle
        };

        const text = editor.document.getText();
        const styleRanges = new Map();
        const outlineRanges = [];
        const bracketRanges = new Map();
        
        // 为每个符号初始化范围数组
        for (const symbol of Object.keys(config.special_symbols.styles)) {
            styleRanges.set(symbol, []);
        }

        // 初始化括号范围数组
        if (config.bracket_colors && config.bracket_colors.length > 0) {
            for (let i = 0; i < config.bracket_colors.length; i++) {
                bracketRanges.set(`bracket_${i}`, []);
            }
        }

        // 获取所有符号并按长度降序排序
        const sortedSymbols = Object.keys(config.special_symbols.styles).sort((a, b) => b.length - a.length);

        // 使用已处理的位置集合来避免重复处理
        const processedPositions = new Set();

        // 按长度降序处理每个符号
        for (const symbol of sortedSymbols) {
            const regex = new RegExp(escapeRegExp(symbol), 'g');
            let match;
            while ((match = regex.exec(text)) !== null) {
                const startPos = match.index;
                const endPos = startPos + symbol.length;

                // 检查当前位置是否已被处理
                let isProcessed = false;
                for (let i = startPos; i < endPos; i++) {
                    if (processedPositions.has(i)) {
                        isProcessed = true;
                        break;
                    }
                }
                if (isProcessed) continue;

                // 标记已处理的位置
                for (let i = startPos; i < endPos; i++) {
                    processedPositions.add(i);
                }

                const startPosition = editor.document.positionAt(startPos);
                // 找到下一个符号或行尾的位置
                let nextEndIndex = text.indexOf('\n', endPos);
                if (nextEndIndex === -1) nextEndIndex = text.length;
                
                // 检查是否有其他符号在当前符号之后
                for (const otherSymbol of sortedSymbols) {
                    if (otherSymbol !== symbol) {
                        const nextSymbolIndex = text.indexOf(otherSymbol, endPos);
                        if (nextSymbolIndex !== -1 && nextSymbolIndex < nextEndIndex) {
                            nextEndIndex = nextSymbolIndex;
                        }
                    }
                }
                
                const endPosition = editor.document.positionAt(nextEndIndex);
                const range = new vscode.Range(startPosition, endPosition);
                styleRanges.get(symbol).push(range);
            }
        }

        // 处理括号彩色化
        if (config.bracket_colors && config.bracket_colors.length > 0) {
            // 使用栈来匹配括号
            const stack = [];
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                
                // 检查是否是开括号
                for (const [open, close] of this.bracketPairs) {
                    if (char === open) {
                        stack.push({
                            char: open,
                            index: i,
                            colorIndex: stack.length % config.bracket_colors.length
                        });
                        break;
                    }
                }

                // 检查是否是闭括号
                for (const [open, close] of this.bracketPairs) {
                    if (char === close && stack.length > 0) {
                        const last = stack[stack.length - 1];
                        if (last.char === open) {
                            const colorIndex = last.colorIndex;
                            const openRange = new vscode.Range(
                                editor.document.positionAt(last.index),
                                editor.document.positionAt(last.index + 1)
                            );
                            const closeRange = new vscode.Range(
                                editor.document.positionAt(i),
                                editor.document.positionAt(i + 1)
                            );
                            bracketRanges.get(`bracket_${colorIndex}`).push(openRange, closeRange);
                            stack.pop();
                        }
                    }
                }
            }
        }

        // 处理自动大纲
        for (let i = 0; i < editor.document.lineCount; i++) {
            const line = editor.document.lineAt(i);
            const text = line.text;
            const indent = text.search(/\S|$/);
            
            // 如果行没有缩进且不是空行
            if (indent === 0 && text.trim().length > 0) {
                // 检查是否有子项
                let hasChildren = false;
                let nextLine = i + 1;
                while (nextLine < editor.document.lineCount) {
                    const nextLineText = editor.document.lineAt(nextLine).text;
                    const nextIndent = nextLineText.search(/\S|$/);
                    if (nextIndent === 0) break;
                    if (nextIndent > 0 && nextLineText.trim().length > 0) {
                        hasChildren = true;
                        break;
                    }
                    nextLine++;
                }

                // 只有当有子项时才添加为大纲项
                if (hasChildren) {
                    const range = new vscode.Range(
                        new vscode.Position(i, 0),
                        new vscode.Position(i, text.length)
                    );
                    
                    this.outlineLevels.set(i, 1);
                    this.outlineRanges.set(i, range);
                    outlineRanges.push(range);
                }
            }
        }

        // 应用样式装饰器
        for (const [symbol, decoration] of this.decorations.entries()) {
            if (symbol === 'outline') {
                editor.setDecorations(decoration, outlineRanges);
            } else if (symbol.startsWith('bracket_')) {
                editor.setDecorations(decoration, bracketRanges.get(symbol) || []);
            } else {
                editor.setDecorations(decoration, styleRanges.get(symbol) || []);
            }
        }
    }

    /**
     * 处理大纲点击事件
     * @param {vscode.TextEditor} editor - 当前编辑器
     * @param {vscode.Position} position - 点击位置
     */
    handleOutlineClick(editor, position) {
        const line = position.line;
        const level = this.outlineLevels.get(line);
        if (!level) return;

        const range = this.outlineRanges.get(line);
        if (!range) return;

        // 获取当前行的缩进级别
        const currentIndent = this.getLineIndent(editor.document, line);
        
        // 查找下一个相同或更高层级的大纲
        let nextLine = line + 1;
        while (nextLine < editor.document.lineCount) {
            const nextIndent = this.getLineIndent(editor.document, nextLine);
            if (nextIndent <= currentIndent) break;
            
            // 切换行的可见性
            editor.selection = new vscode.Selection(
                new vscode.Position(nextLine, 0),
                new vscode.Position(nextLine, 0)
            );
            vscode.commands.executeCommand('editor.toggleLineVisibility');
            
            nextLine++;
        }
    }

    /**
     * 获取行的缩进级别
     * @param {vscode.TextDocument} document - 文档对象
     * @param {number} line - 行号
     * @returns {number} - 缩进级别
     */
    getLineIndent(document, line) {
        const text = document.lineAt(line).text;
        return text.search(/\S|$/);
    }
}

/**
 * 文档符号提供者
 */
class MyDocumentSymbolProvider {
    provideDocumentSymbols(document, token) {
        const symbols = [];
        const stack = [{ level: -1, symbol: null }];
        const hasChildren = new Set();

        // 第一遍扫描：标记所有有子项的行
        for (let i = 0; i < document.lineCount - 1; i++) {
            const currentLine = document.lineAt(i);
            const currentText = currentLine.text;
            const currentIndent = currentText.search(/\S|$/);
            
            if (currentText.trim().length > 0) {
                // 检查后续行是否有缩进
                let hasChild = false;
                let nextLine = i + 1;
                
                while (nextLine < document.lineCount) {
                    const nextLineText = document.lineAt(nextLine).text;
                    const nextIndent = nextLineText.search(/\S|$/);
                    
                    // 如果遇到相同或更小缩进的非空行，停止检查
                    if (nextIndent <= currentIndent && nextLineText.trim().length > 0) {
                        break;
                    }
                    
                    // 如果找到有缩进的非空行，标记为有子项
                    if (nextIndent > currentIndent && nextLineText.trim().length > 0) {
                        hasChild = true;
                        break;
                    }
                    
                    nextLine++;
                }
                
                if (hasChild) {
                    hasChildren.add(i);
                }
            }
        }

        // 第二遍扫描：构建大纲
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const text = line.text;
            const indent = text.search(/\S|$/);
            
            // 如果行不是空行且有子项
            if (text.trim().length > 0 && hasChildren.has(i)) {
                // 计算当前行的层级（每4个空格为一级）
                const level = Math.floor(indent / 4);
                
                // 回退到当前层级
                while (stack.length > 1 && stack[stack.length - 1].level >= level) {
                    stack.pop();
                }

                // 创建符号
                const name = text.trim();
                const range = new vscode.Range(
                    new vscode.Position(i, indent),
                    new vscode.Position(i, text.length)
                );
                
                const symbol = new vscode.DocumentSymbol(
                    name,
                    '',  // 详情
                    vscode.SymbolKind.Variable,
                    range,
                    range
                );

                // 添加到父级或根级
                if (stack[stack.length - 1].symbol) {
                    stack[stack.length - 1].symbol.children.push(symbol);
                } else {
                    symbols.push(symbol);
                }

                // 将当前符号压入栈
                stack.push({ level, symbol });
            }
        }

        return symbols;
    }
}

module.exports = {
    DecoratorManager,
    MyDocumentSymbolProvider
}; 