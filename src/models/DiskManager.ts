import * as vscode from "vscode";
import { Disk } from "./Disk";
import { EdgeCLI } from "../edge-cli/edge-cli";
const { execSync } = require("child_process");

export class DiskManager {
  private outputChannel: vscode.OutputChannel;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  async getDisks(): Promise<Disk[]> {
    const cli = await EdgeCLI.create();
    if (!cli) {
      return [];
    }

    // Execute the edge imager list command
    const output = execSync(`${cli.path} imager list --json --all`).toString();
    
    // Parse the JSON output
    return JSON.parse(output);
  }

  async flashEdgeOS(disk: Disk, image: string): Promise<void> {
    const cli = await EdgeCLI.create();
    if (!cli) {
      return;
    }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: "Flashing EdgeOS"
    }, async (progress, token) => {
        this.outputChannel.appendLine(`Flashing EdgeOS to disk ${disk.id} with image ${image}`);
        // TODO: Cancellation and progress reporting
        // Execute the edge imager flash command
        const output = execSync(`${cli.path} imager write-device ${image} ${disk.id} --force`).toString();
        this.outputChannel.appendLine(output);
      }
    );
  }
}
