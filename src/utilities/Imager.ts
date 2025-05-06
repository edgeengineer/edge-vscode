import { execSync } from "child_process";
import { EdgeCLI } from "../edge-cli/edge-cli";

export class EdgeImager {
  static async listSupportedDevices(): Promise<string[]> {
    const cli = await EdgeCLI.create();
    if (!cli) {
      return [];
    }

    const output = execSync(`${cli.path} imager list-devices --json`).toString();
    const devices = JSON.parse(output);
    return devices.map((device: any) => device.name);
  }
}