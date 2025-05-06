/**
 * Represents an Edge device that can be connected to
 */
export class Device {
  constructor(
    /**
     * Unique identifier for the device
     */
    public readonly id: string,

    /**
     * Network address in hostname or hostname:port format
     */
    public readonly address: string,

    /**
     * Name of the device
     */
    public readonly name: string,

    /**
     * Interface type of the device
     */
    public readonly connectionType: "Ethernet" | "USB" | "LAN" | "Custom"
  ) {}
}
