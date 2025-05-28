import { exec } from "child_process";
import { EdgeCLI } from "../edge-cli/edge-cli";

export class EdgeImager {
  static async listSupportedDevices(): Promise<string[]> {
    const cli = await EdgeCLI.create();
    if (!cli) {
      return [];
    }

    const output = await new Promise<string>((resolve, reject) => {
      exec(`${cli.path} imager list-devices --json`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        }
        resolve(stdout);
      });
    });
    const devices = JSON.parse(output);
    return devices.map((device: any) => device.name);
  }
}