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
        ${Object.entries(config.special_symbols.styles).map(([symbol, style]) => {
            const className = symbol.replace(/[^a-zA-Z0-9]/g, '_');
            return `.${className} {
                color: ${style.color || config.default_text.color};
                font-weight: ${style.fontWeight || config.default_text.fontWeight};
                font-style: ${style.fontStyle || config.default_text.fontStyle};
                font-family: ${style.fontFamily || config.default_text.fontFamily};
                background-color: ${style.backgroundColor || config.default_text.backgroundColor};
                text-decoration: ${style.textDecoration || config.default_text.textDecoration};
                text-shadow: ${style.textShadow || config.default_text.textShadow};
                border: ${style.border || config.default_text.border};
                border-radius: ${style.borderRadius || config.default_text.borderRadius};
            }`;
        }).join('\n        ')}
        
        /* 括号样式 */
        ${config.bracket_colors.map((color, index) => 
            `.bracket-${index} { color: ${color}; }`
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

    // 括号对定义
    const bracketPairs = [
        ['(', ')'],
        ['[', ']'],
        ['{', '}'],
        ['（', '）'],
        ['［', '］'],
        ['｛', '｝']
    ];

    lines.forEach(line => {
        // 保留原始空白字符
        if (line === '') {
            htmlContent += '\n';
            return;
        }

        let processedLine = line;
        
        // 处理括号彩色化
        const stack = [];
        const bracketPositions = [];
        
        for (let i = 0; i < processedLine.length; i++) {
            const char = processedLine[i];
            
            // 检查是否是开括号
            for (const [open, close] of bracketPairs) {
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
            for (const [open, close] of bracketPairs) {
                if (char === close && stack.length > 0) {
                    const last = stack[stack.length - 1];
                    if (last.char === open) {
                        bracketPositions.push({
                            position: last.index,
                            length: 1,
                            colorIndex: last.colorIndex,
                            type: 'open'
                        });
                        bracketPositions.push({
                            position: i,
                            length: 1,
                            colorIndex: last.colorIndex,
                            type: 'close'
                        });
                        stack.pop();
                    }
                }
            }
        }

        // 处理特殊符号
        const sortedSymbols = Object.keys(config.special_symbols.styles).sort((a, b) => b.length - a.length);
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
                    const className = symbol.replace(/[^a-zA-Z0-9]/g, '_');
                    symbolPositions.push({
                        symbol,
                        position: pos,
                        length: symbol.length,
                        className
                    });
                }
                pos += symbol.length;
            }
        }

        // 合并所有位置信息
        const allPositions = [
            ...symbolPositions.map(sp => ({ ...sp, type: 'symbol' })),
            ...bracketPositions.map(bp => ({ ...bp, type: 'bracket' }))
        ].sort((a, b) => a.position - b.position);

        // 从后向前处理，避免位置偏移
        let lastPosition = processedLine.length;
        for (let i = allPositions.length - 1; i >= 0; i--) {
            const pos = allPositions[i];
            const textToStyle = processedLine.substring(pos.position, lastPosition);
            
            if (textToStyle) {
                let styledText;
                if (pos.type === 'symbol') {
                    const displaySymbol = config.replace ? config.replace_symbol : pos.symbol;
                    const remainingText = textToStyle.substring(pos.length);
                    // 移除文本中的换行符，保持行距一致
                    const cleanText = remainingText.replace(/\n/g, '');
                    styledText = `<span class="${pos.className}">${displaySymbol}${cleanText}</span>`;
                } else if (pos.type === 'bracket') {
                    // 只对括号本身进行染色
                    const bracketChar = textToStyle.charAt(0);
                    const remainingText = textToStyle.substring(1);
                    styledText = `<span class="bracket-${pos.colorIndex}">${bracketChar}</span>${remainingText}`;
                }
                
                processedLine = processedLine.substring(0, pos.position) + 
                              styledText + 
                              processedLine.substring(lastPosition);
            }
            lastPosition = pos.position;
        }

        // 移除行尾的换行符
        processedLine = processedLine.replace(/\n$/, '');

        // 所有行都使用 item 类，确保行距一致
        htmlContent += `<div class="item" style="line-height: ${baseConfig.page.line_height};">${processedLine}</div>\n`;
    });

    htmlContent += `</body>
</html>`;

    return htmlContent;
}

module.exports = {
    textToHtml
}; 