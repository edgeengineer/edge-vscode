import * as vscode from 'vscode';
import { Device, mockDevices } from '../models/device';

export class DeviceTreeItem extends vscode.TreeItem {
    constructor(
        public readonly device: Device,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(device.name, collapsibleState);
        this.tooltip = `${device.name} (${device.ip})`;
        this.description = device.type;
        this.contextValue = 'device';
        
        // Add a command to open the device details page when clicked
        this.command = {
            command: 'edge-developer-extension.openDeviceDetails',
            title: 'Open Device Details',
            arguments: [this.device]
        };
    }
}

export class DeviceProvider implements vscode.TreeDataProvider<DeviceTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<DeviceTreeItem | undefined | null | void> = new vscode.EventEmitter<DeviceTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DeviceTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private devices: Device[] = [];

    constructor() {
        // Initialize with mock devices
        this.devices = [...mockDevices].sort((a, b) => a.name.localeCompare(b.name));
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: DeviceTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: DeviceTreeItem): Thenable<DeviceTreeItem[]> {
        if (element) {
            // No child items for devices
            return Promise.resolve([]);
        } else {
            // Return all devices as root items
            return Promise.resolve(
                this.devices.map(device => 
                    new DeviceTreeItem(device, vscode.TreeItemCollapsibleState.None)
                )
            );
        }
    }

    // Add a new device to the list
    addDevice(device: Device): void {
        this.devices.push(device);
        // Sort devices by name
        this.devices = this.devices.sort((a, b) => a.name.localeCompare(b.name));
        this.refresh();
    }

    // Get a device by ID
    getDeviceById(id: string): Device | undefined {
        return this.devices.find(device => device.id === id);
    }
}
