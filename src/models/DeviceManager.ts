import * as vscode from "vscode";
import { Device } from "./Device";
import { v7 as uuidv7 } from "uuid";

/**
 * Manages devices stored in VS Code configuration
 */
export class DeviceManager {
  private static readonly CONFIG_KEY = "edgeos.devices";
  private static readonly CURRENT_DEVICE_KEY = "edgeos.currentDevice";
  private _onDevicesChanged = new vscode.EventEmitter<void>();
  readonly onDevicesChanged = this._onDevicesChanged.event;

  private _onCurrentDeviceChanged = new vscode.EventEmitter<
    string | undefined
  >();
  readonly onCurrentDeviceChanged = this._onCurrentDeviceChanged.event;

  constructor() {}

  /**
   * Get all configured devices
   */
  getDevices(): Device[] {
    const config = vscode.workspace.getConfiguration();
    const devices =
      config.get<Array<{ id: string; address: string }>>(
        DeviceManager.CONFIG_KEY
      ) || [];
    return devices.map((d) => new Device(d.id, d.address));
  }

  /**
   * Get the current active device ID
   */
  getCurrentDeviceId(): string | undefined {
    const config = vscode.workspace.getConfiguration();
    return config.get<string>(DeviceManager.CURRENT_DEVICE_KEY);
  }

  /**
   * Get the current active device
   */
  getCurrentDevice(): Device | undefined {
    const currentId = this.getCurrentDeviceId();
    if (!currentId) {
      return undefined;
    }

    const device = this.getDevices().find((d) => d.id === currentId);
    return device;
  }

  /**
   * Set the current active device
   */
  async setCurrentDevice(deviceId: string | undefined): Promise<void> {
    const config = vscode.workspace.getConfiguration();

    // If trying to set a device, make sure it exists
    if (deviceId && !this.getDevices().some((d) => d.id === deviceId)) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }

    await config.update(
      DeviceManager.CURRENT_DEVICE_KEY,
      deviceId,
      vscode.ConfigurationTarget.Global
    );

    this._onCurrentDeviceChanged.fire(deviceId);
    this._onDevicesChanged.fire();
  }

  /**
   * Add a new device
   * @param address The device address (hostname or hostname:port)
   */
  async addDevice(address: string): Promise<Device> {
    const config = vscode.workspace.getConfiguration();
    const devices =
      config.get<Array<{ id: string; address: string }>>(
        DeviceManager.CONFIG_KEY
      ) || [];

    // Check for duplicate addresses
    if (devices.some((d) => d.address === address)) {
      throw new Error(`Device with address ${address} already exists`);
    }

    const newDevice = { id: uuidv7(), address };
    devices.push(newDevice);

    await config.update(
      DeviceManager.CONFIG_KEY,
      devices,
      vscode.ConfigurationTarget.Global
    );

    // If this is the first device, automatically set it as current
    if (devices.length === 1) {
      await this.setCurrentDevice(newDevice.id);
    } else {
      this._onDevicesChanged.fire();
    }

    return new Device(newDevice.id, newDevice.address);
  }

  /**
   * Delete a device by ID
   * @param deviceId ID of the device to remove
   */
  async deleteDevice(deviceId: string): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    const devices =
      config.get<Array<{ id: string; address: string }>>(
        DeviceManager.CONFIG_KEY
      ) || [];

    const updatedDevices = devices.filter((d) => d.id !== deviceId);

    if (updatedDevices.length === devices.length) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }

    await config.update(
      DeviceManager.CONFIG_KEY,
      updatedDevices,
      vscode.ConfigurationTarget.Global
    );

    // If we deleted the current device, clear the current device
    const currentDeviceId = this.getCurrentDeviceId();
    if (currentDeviceId === deviceId) {
      // Set to another device if available, otherwise clear it
      if (updatedDevices.length > 0) {
        await this.setCurrentDevice(updatedDevices[0].id);
      } else {
        await this.setCurrentDevice(undefined);
      }
    } else {
      this._onDevicesChanged.fire();
    }
  }
}
