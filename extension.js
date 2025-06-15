const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { textToHtml } = require('./components/to_html');
const { DecoratorManager, MyDocumentSymbolProvider } = require('./components/decorator');

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
        const configPath = path.join(__dirname, 'config/config.json');
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
        const baseConfigPath = path.join(__dirname, 'config/base_config.json');
        const baseConfigContent = fs.readFileSync(baseConfigPath, 'utf8');
        return JSON.parse(baseConfigContent);
    } catch (error) {
        console.error('无法加载基础配置文件:', error);
        return {
            page: {
                title: "MoYuNote",
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
 * 检查文件类型是否支持
 * @param {string} fileName - 文件名
 * @param {Object} config - 配置对象
 * @returns {boolean} - 是否支持该文件类型
 */
function isFileTypeSupported(fileName, config) {
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
function getFileTypeStyle(fileName, config) {
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
    let decoratorManager = new DecoratorManager();
    let exportTreeProvider = new ExportTreeProvider();

    // 初始化装饰器
    decoratorManager.createDecorations(config);

    // 注册命令
    const commands = [
        vscode.commands.registerCommand('moyu-note.activate', () => {
            config = loadConfig();
            baseConfig = loadBaseConfig();
            decoratorManager.createDecorations(config);
            decoratorManager.updateDecorations(config);
        }),
        vscode.commands.registerCommand('moyu-note.openConfig', async () => {
            const configPath = path.join(__dirname, 'config/config.json');
            try {
                const doc = await vscode.workspace.openTextDocument(configPath);
                await vscode.window.showTextDocument(doc);
            } catch (error) {
                vscode.window.showErrorMessage('无法打开配置文件：' + error.message);
            }
        }),
        vscode.commands.registerCommand('moyu-note.openBaseConfig', async () => {
            const baseConfigPath = path.join(__dirname, 'config/base_config.json');
            try {
                const doc = await vscode.workspace.openTextDocument(baseConfigPath);
                await vscode.window.showTextDocument(doc);
            } catch (error) {
                vscode.window.showErrorMessage('无法打开基础配置文件：' + error.message);
            }
        }),
        vscode.commands.registerCommand('moyu-note.exportHtml', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('没有打开的编辑器');
                return;
            }

            // 检查文件类型
            const fileName = editor.document.fileName;
            if (!isFileTypeSupported(fileName, config)) {
                vscode.window.showErrorMessage('不支持的文件类型');
                return;
            }

            // 重新加载配置以确保使用最新设置
            config = loadConfig();
            baseConfig = loadBaseConfig();

            const text = editor.document.getText();
            const fileStyle = getFileTypeStyle(fileName, config);
            const htmlContent = textToHtml(text, config, baseConfig, fileStyle);

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
        vscode.commands.registerCommand('moyu-note.exportHtmlWithPicker', async () => {
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
                    'MoYu Note Files': ['myn']
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
    const treeView = vscode.window.createTreeView('moyu-note-symbols', {
        treeDataProvider: exportTreeProvider
    });

    // 监听文档变化
    vscode.workspace.onDidChangeTextDocument(event => {
        decoratorManager.updateDecorations(config);
    });

    // 监听编辑器切换
    vscode.window.onDidChangeActiveTextEditor(() => {
        decoratorManager.updateDecorations(config);
    });

    // 监听配置文件变化
    const configWatcher = vscode.workspace.createFileSystemWatcher('**/config/config.json');
    configWatcher.onDidChange(() => {
        config = loadConfig();
        decoratorManager.createDecorations(config);
        decoratorManager.updateDecorations(config);
    });

    // 监听基础配置文件变化
    const baseConfigWatcher = vscode.workspace.createFileSystemWatcher('**/config/base_config.json');
    baseConfigWatcher.onDidChange(() => {
        baseConfig = loadBaseConfig();
        // 如果当前有打开的编辑器，更新装饰器
        if (vscode.window.activeTextEditor) {
            decoratorManager.updateDecorations(config);
        }
    });

    // 初始更新
    decoratorManager.updateDecorations(config);

    // 注册文档符号提供者
    const symbolProvider = new MyDocumentSymbolProvider();
    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            { scheme: 'file', pattern: '**/*.myn' },
            symbolProvider
        )
    );

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