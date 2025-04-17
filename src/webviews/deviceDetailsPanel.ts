import * as vscode from 'vscode';
import { Device, WiFiNetwork, mockWiFiNetworks } from '../models/device';

export class DeviceDetailsPanel {
    public static currentPanel: DeviceDetailsPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _device: Device;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri, device: Device) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it
        if (DeviceDetailsPanel.currentPanel) {
            DeviceDetailsPanel.currentPanel._panel.reveal(column);
            DeviceDetailsPanel.currentPanel.update(device);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            'deviceDetails',
            `Device: ${device.name}`,
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media')
                ]
            }
        );

        DeviceDetailsPanel.currentPanel = new DeviceDetailsPanel(panel, extensionUri, device);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, device: Device) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._device = device;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this._panel.onDidChangeViewState(
            e => {
                if (this._panel.visible) {
                    this._update();
                }
            },
            null,
            this._disposables
        );

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'setupTasksAndLaunch':
                        vscode.window.showInformationMessage(`Setting up tasks.json and launch.json for ${this._device.name}`);
                        this._setupTasksAndLaunch();
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public update(device: Device) {
        this._device = device;
        this._panel.title = `Device: ${device.name}`;
        this._update();
    }

    public dispose() {
        DeviceDetailsPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        const webview = this._panel.webview;
        this._panel.title = `Device: ${this._device.name}`;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // Get mock WiFi networks
        const wifiNetworks = mockWiFiNetworks;

        // Create HTML for device properties table
        const devicePropertiesHtml = `
            <table class="device-properties">
                <tr>
                    <th>Property</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Name</td>
                    <td>${this._device.name}</td>
                </tr>
                <tr>
                    <td>Type</td>
                    <td>${this._device.type}</td>
                </tr>
                <tr>
                    <td>IP Address</td>
                    <td>${this._device.ip}</td>
                </tr>
                <tr>
                    <td>Port</td>
                    <td>${this._device.port}</td>
                </tr>
                <tr>
                    <td>Host</td>
                    <td>${this._device.host}</td>
                </tr>
                <tr>
                    <td>Operating System</td>
                    <td>${this._device.operatingSystem}</td>
                </tr>
                <tr>
                    <td>OS Version</td>
                    <td>${this._device.operatingSystemVersion}</td>
                </tr>
            </table>
        `;

        // Create HTML for WiFi networks table
        const wifiNetworksHtml = `
            <table class="wifi-networks">
                <tr>
                    <th>SSID</th>
                    <th>Status</th>
                    <th>Signal Strength</th>
                    <th>Security</th>
                </tr>
                ${wifiNetworks.map(network => `
                    <tr>
                        <td>${network.ssid}</td>
                        <td>${network.isConnected ? '<span class="connected">Connected</span>' : 'Not Connected'}</td>
                        <td>
                            <div class="signal-strength">
                                <div class="signal-bar" style="width: ${network.signalStrength}%"></div>
                            </div>
                            ${network.signalStrength}%
                        </td>
                        <td>${network.secured ? 'Secured' : 'Open'}</td>
                    </tr>
                `).join('')}
            </table>
        `;

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Device Details: ${this._device.name}</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    padding: 20px;
                }
                h1, h2 {
                    color: var(--vscode-editor-foreground);
                    border-bottom: 1px solid var(--vscode-panel-border);
                    padding-bottom: 10px;
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                    margin-bottom: 20px;
                }
                th, td {
                    text-align: left;
                    padding: 8px;
                    border: 1px solid var(--vscode-panel-border);
                }
                th {
                    background-color: var(--vscode-editor-lineHighlightBackground);
                }
                tr:nth-child(even) {
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                }
                .connected {
                    color: var(--vscode-terminal-ansiGreen);
                    font-weight: bold;
                }
                .signal-strength {
                    width: 100px;
                    height: 10px;
                    background-color: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-panel-border);
                    display: inline-block;
                    margin-right: 10px;
                }
                .signal-bar {
                    height: 100%;
                    background-color: var(--vscode-terminal-ansiGreen);
                }
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    cursor: pointer;
                    font-size: 14px;
                    border-radius: 2px;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .section {
                    margin-bottom: 30px;
                }
            </style>
        </head>
        <body>
            <h1>Device Details: ${this._device.name}</h1>
            
            <div class="section">
                <h2>Device Properties</h2>
                ${devicePropertiesHtml}
            </div>
            
            <div class="section">
                <h2>WiFi Networks</h2>
                ${wifiNetworksHtml}
            </div>
            
            <div class="section">
                <button id="setupButton">Setup VSCode tasks.json and launch.json</button>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                
                document.getElementById('setupButton').addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'setupTasksAndLaunch'
                    });
                });
            </script>
        </body>
        </html>`;
    }

    private _setupTasksAndLaunch() {
        // This would be implemented to create or update tasks.json and launch.json
        // For now, just show a message
        vscode.window.showInformationMessage(`Setting up tasks.json and launch.json for ${this._device.name}`);
    }
}
