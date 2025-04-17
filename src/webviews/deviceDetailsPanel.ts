import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Device, WiFiNetwork, mockWiFiNetworks } from '../models/device';

export class DeviceDetailsPanel {
    public static currentPanel: DeviceDetailsPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _device: Device;
    private _wifiNetworks: WiFiNetwork[];
    private _disposables: vscode.Disposable[] = [];
    private _refreshInterval: NodeJS.Timeout | undefined;

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
                    vscode.Uri.joinPath(extensionUri, 'resources')
                ]
            }
        );

        DeviceDetailsPanel.currentPanel = new DeviceDetailsPanel(panel, extensionUri, device);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, device: Device) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._device = device;
        this._wifiNetworks = [...mockWiFiNetworks];

        // Set the webview's initial html content
        this._update();

        // Set up background refresh
        this._setupBackgroundRefresh();

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
                    case 'refreshDevice':
                        vscode.window.showInformationMessage(`Refreshing device information for ${this._device.name}`);
                        this._refreshDeviceInfo();
                        return;
                    case 'refreshWifi':
                        vscode.window.showInformationMessage(`Refreshing WiFi networks for ${this._device.name}`);
                        this._refreshWifiNetworks();
                        return;
                    case 'disconnectWifi':
                        vscode.window.showInformationMessage(`Disconnecting from WiFi network: ${message.ssid}`);
                        this._disconnectWifi(message.ssid);
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

        // Clear the background refresh interval
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
            this._refreshInterval = undefined;
        }

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _setupBackgroundRefresh() {
        // Set up a refresh every 30 seconds
        this._refreshInterval = setInterval(() => {
            if (this._panel.visible) {
                this._refreshDeviceInfo();
                this._refreshWifiNetworks();
            }
        }, 30000);
    }

    private _refreshDeviceInfo() {
        // In a real implementation, this would fetch updated device info from the device
        // For now, we'll just simulate a refresh with a small delay
        setTimeout(() => {
            this._update();
        }, 500);
    }

    private _refreshWifiNetworks() {
        // In a real implementation, this would fetch updated WiFi networks from the device
        // For now, we'll just simulate a refresh with a small delay and random signal strength changes
        setTimeout(() => {
            // Simulate changing signal strengths
            this._wifiNetworks = this._wifiNetworks.map(network => ({
                ...network,
                signalStrength: Math.min(100, Math.max(0, network.signalStrength + (Math.random() * 10 - 5)))
            }));
            this._update();
        }, 500);
    }

    private _disconnectWifi(ssid: string) {
        // In a real implementation, this would send a command to the device to disconnect from the network
        // For now, we'll just update our mock data
        this._wifiNetworks = this._wifiNetworks.map(network => 
            network.ssid === ssid ? { ...network, isConnected: false } : network
        );
        this._update();
    }

    private _update() {
        const webview = this._panel.webview;
        this._panel.title = `Device: ${this._device.name}`;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // Get WiFi networks
        const wifiNetworks = this._wifiNetworks;

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
                        <td>
                            ${network.isConnected 
                                ? `<span class="connected">Connected</span>
                                   <button class="disconnect-button disconnect-wifi" data-ssid="${network.ssid}">Disconnect</button>` 
                                : 'Not Connected'}
                        </td>
                        <td>
                            <div class="signal-strength">
                                <div class="signal-bar" style="width: ${network.signalStrength}%"></div>
                            </div>
                            ${Math.round(network.signalStrength)}%
                        </td>
                        <td>${network.secured ? 'Secured' : 'Open'}</td>
                    </tr>
                `).join('')}
            </table>
        `;

        // Load the HTML template from the resources directory
        const templatePath = path.join(this._extensionUri.fsPath, 'resources', 'device-details-template.html');
        let templateHtml = fs.readFileSync(templatePath, 'utf8');
        
        // Replace placeholders with actual content
        templateHtml = templateHtml.replace(/{{DEVICE_NAME}}/g, this._device.name)
                                  .replace('{{DEVICE_PROPERTIES}}', devicePropertiesHtml)
                                  .replace('{{WIFI_NETWORKS}}', wifiNetworksHtml);
        
        return templateHtml;
    }
}
