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

module.exports = {
    textToHtml
}; 