import {
  execFile,
  expandFilePathTilde,
  getErrorDescription,
} from "../utilities/utilities";
import * as fs from "fs/promises";
import * as vscode from "vscode";

export class EdgeCLI {
  public version: string;

  constructor(public readonly path: string, version?: string) {
    this.version = version || "";
  }

  static async create(): Promise<EdgeCLI | undefined> {
    try {
      const path = await EdgeCLI.getEdgePath();
      const cli = new EdgeCLI(path);
      cli.version = await cli.getVersion();
      return cli;
    } catch (error) {
      console.error("Failed to create EdgeCLI:", getErrorDescription(error));
      return undefined;
    }
  }

  private static async getEdgePath(): Promise<string> {
    // Check if a custom path is configured
    const config = vscode.workspace.getConfiguration("edgeos");
    const configuredPath = config.get<string>("cliPath");

    if (configuredPath && configuredPath.trim() !== "") {
      try {
        // Check if the configured path exists and is executable
        const expandedPath = expandFilePathTilde(configuredPath);
        await fs.access(expandedPath, fs.constants.X_OK);
        return expandedPath;
      } catch (error) {
        throw new Error(
          `Configured Edge CLI path "${configuredPath}" is not accessible or executable.`
        );
      }
    }

    // Fall back to auto-discovery if no path is configured
    try {
      let edgeCli: string;
      // TODO: Allow overriding the path via a setting.
      switch (process.platform) {
        case "darwin": {
          const { stdout } = await execFile("which", ["edge"]);
          edgeCli = stdout.trimEnd();
          break;
        }
        default: {
          // similar to SwiftToolchain.getSwiftFolderPath(), use `type` to find `edge`
          const { stdout } = await execFile("/bin/sh", [
            "-c",
            "LC_MESSAGES=C type edge",
          ]);
          const edgeMatch = /^edge is (.*)$/.exec(stdout.trimEnd());
          if (edgeMatch) {
            edgeCli = edgeMatch[1];
          } else {
            throw Error("Failed to find edge executable");
          }
          break;
        }
      }

      // It might be a symbolic link, so resolve it.
      const realEdge = await fs.realpath(edgeCli);
      return expandFilePathTilde(realEdge);
    } catch (error) {
      throw new Error(`Failed to find edge executable`);
    }
  }

  private async exec(args: string[]): Promise<string> {
    const { stdout } = await execFile(this.path, args);
    return stdout.trimEnd();
  }

  public async getVersion(): Promise<string> {
    return await this.exec(["--version"]);
  }
}
