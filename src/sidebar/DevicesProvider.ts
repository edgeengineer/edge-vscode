import * as vscode from "vscode";
import { Device } from "../models/Device";
import { DeviceManager } from "../models/DeviceManager";

export class DeviceTreeItem extends vscode.TreeItem {
  constructor(public readonly device: Device) {
    super(device.address, vscode.TreeItemCollapsibleState.None);
    this.tooltip = `Device: ${device.id}`;
    this.description = device.address;
    this.iconPath = new vscode.ThemeIcon("vm-running");
    this.contextValue = "device";
  }
}

export class DevicesProvider
  implements vscode.TreeDataProvider<DeviceTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    DeviceTreeItem | undefined | null | void
  > = new vscode.EventEmitter<DeviceTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    DeviceTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(private deviceManager: DeviceManager) {
    // Listen for device changes
    this.deviceManager.onDevicesChanged(() => {
      this.refresh();
    });
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: DeviceTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: DeviceTreeItem): Thenable<DeviceTreeItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      const devices = this.deviceManager.getDevices();
      return Promise.resolve(
        devices.map((device) => new DeviceTreeItem(device))
      );
    }
  }
}
