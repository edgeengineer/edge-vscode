import * as vscode from "vscode";
import { Disk } from "./Disk";
import { EdgeCLI } from "../edge-cli/edge-cli";
import { spawn, execSync } from "child_process";

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
      title: "Flashing EdgeOS",
      cancellable: true,
    }, async (progress, token) => {
      this.outputChannel.appendLine(`Flashing EdgeOS to disk ${disk.id} with image ${image}`);

      const terminal = vscode.window.createTerminal({
        name: "EdgeOS Flasher",
        shellPath: cli.path,
        shellArgs: ["imager", "write-device", image, disk.id, "--force"]
      });

      terminal.show();

      token.onCancellationRequested(() => {
        this.outputChannel.appendLine("Flashing cancelled by user. Closing terminal...");
        terminal.dispose();
      });
    });
  }
}
