import * as vscode from "vscode";
import { EdgeCLI } from "../edge-cli/edge-cli";

export const EDGE_LAUNCH_CONFIG_TYPE = "edge";

export class EdgeDebugConfigurationProvider
  implements vscode.DebugConfigurationProvider
{
  constructor(
    private readonly outputChannel: vscode.OutputChannel,
    private readonly cli: EdgeCLI
  ) {}

  async resolveDebugConfigurationWithSubstitutedVariables(
    folder: vscode.WorkspaceFolder | undefined,
    debugConfiguration: vscode.DebugConfiguration,
    token?: vscode.CancellationToken
  ): Promise<vscode.DebugConfiguration | undefined | null> {
    debugConfiguration.type = "lldb-dap";

    // TODO: Implement the rest of the EdgeOS debugger configuration

    return debugConfiguration;
  }
}
