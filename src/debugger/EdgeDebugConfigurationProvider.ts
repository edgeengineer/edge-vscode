import * as vscode from "vscode";
import * as path from "path";
import { EdgeCLI } from "../edge-cli/edge-cli";
import { EdgeWorkspaceContext } from "../EdgeWorkspaceContext";
import { DeviceManager } from "../models/DeviceManager";
import { getErrorDescription } from "../utilities/utilities";

export const EDGE_LAUNCH_CONFIG_TYPE = "edge";
// Default debug port used by Edge agent
export const DEFAULT_DEBUG_PORT = 4242;
// Debugger type to use - can be "lldb-dap" or "codelldb"
export type DebuggerType = "lldb-dap" | "codelldb";
export const DEBUGGER_TYPE: DebuggerType = "lldb-dap";

export class EdgeDebugConfigurationProvider
  implements vscode.DebugConfigurationProvider
{
  constructor(
    private readonly outputChannel: vscode.OutputChannel,
    private readonly cli: EdgeCLI,
    private readonly workspaceContext: EdgeWorkspaceContext,
    private readonly deviceManager: DeviceManager
  ) {}

  async provideDebugConfigurations(
    folder: vscode.WorkspaceFolder | undefined,
    token?: vscode.CancellationToken
  ): Promise<vscode.DebugConfiguration[]> {
    const configs: vscode.DebugConfiguration[] = [];

    // Generate a debug configuration for each Swift executable target
    for (const folderContext of this.workspaceContext.folders) {
      const executableProducts = await folderContext.swift.swiftPackage
        .executableProducts;

      for (const product of executableProducts) {
        configs.push({
          type: EDGE_LAUNCH_CONFIG_TYPE,
          name: `Debug ${product.name} on EdgeOS`,
          request: "attach",
          target: product.name,
          cwd: folderContext.swift.folder.fsPath,
          preLaunchTask: `edge: Run ${product.name}`,
        });
      }
    }

    return configs;
  }

  /**
   * Ensure the address includes port 4242 for debugging
   */
  private ensureDebugPort(address: string): string {
    // Check if address already includes a port
    if (address.includes(":")) {
      // Extract host and port
      const [host, port] = address.split(":");

      // If port is already 4242, return as is
      if (port === DEFAULT_DEBUG_PORT.toString()) {
        return address;
      }

      return `${host}:${DEFAULT_DEBUG_PORT}`;
    }

    // No port specified, append the default debug port
    return `${address}:${DEFAULT_DEBUG_PORT}`;
  }

  async resolveDebugConfigurationWithSubstitutedVariables(
    folder: vscode.WorkspaceFolder | undefined,
    debugConfiguration: vscode.DebugConfiguration,
    token?: vscode.CancellationToken
  ): Promise<vscode.DebugConfiguration | undefined | null> {
    // Check if Swift SDK path is set
    const config = vscode.workspace.getConfiguration("edgeos");
    const sdkPath = config.get<string>("swiftSdkPath");

    if (!sdkPath || sdkPath.trim() === "") {
      const actions = ["Configure Swift SDK Path", "Cancel"];
      const selection = await vscode.window.showErrorMessage(
        "Swift SDK path is not set. This is required for debugging EdgeOS applications.",
        ...actions
      );

      if (selection === "Configure Swift SDK Path") {
        await vscode.commands.executeCommand("edge.configureSwiftSdkPath");
      }

      return null; // Cancel debugging
    }

    try {
      // Check if the SDK path exists
      await vscode.workspace.fs.stat(vscode.Uri.file(sdkPath));
    } catch (error) {
      const actions = ["Configure Swift SDK Path", "Cancel"];
      const selection = await vscode.window.showErrorMessage(
        `The configured Swift SDK path "${sdkPath}" does not exist: ${getErrorDescription(
          error
        )}`,
        ...actions
      );

      if (selection === "Configure Swift SDK Path") {
        await vscode.commands.executeCommand("edge.configureSwiftSdkPath");
      }

      return null; // Cancel debugging
    }

    // Check if a device is selected
    const currentDevice = this.deviceManager.getCurrentDevice();
    if (!currentDevice) {
      const actions = ["Add Device", "Select Device", "Cancel"];
      const selection = await vscode.window.showErrorMessage(
        "No EdgeOS device is selected. You must select a device before debugging.",
        ...actions
      );

      if (selection === "Add Device") {
        await vscode.commands.executeCommand("edgeDevices.addDevice");
      } else if (selection === "Select Device") {
        // Open the devices view to allow selection
        await vscode.commands.executeCommand(
          "workbench.view.extension.edge-explorer"
        );
      }

      return null; // Cancel debugging
    }

    // Build debug target path
    const targetBasePath = path.join(
      folder?.uri.fsPath || "",
      ".edge-build/debug"
    );

    // Get the device address and ensure it has the correct debug port
    const remoteAddress = this.ensureDebugPort(currentDevice.address);

    // Check the format of the SDK bundle to ensure we're using the right paths
    const sdkSubPath = "";
    const moduleSubPath =
      "6.1-RELEASE_edgeos_aarch64/aarch64-unknown-linux-gnu/debian-bookworm.sdk/usr/lib/swift_static/linux";

    // Create shared SDK path commands for both debugger types
    const sdkPathCommands = [
      `settings set target.sdk-path "${path.join(sdkPath, sdkSubPath)}"`,
      `settings set target.swift-module-search-paths "${path.join(
        sdkPath,
        moduleSubPath
      )}"`,
    ];

    // Set up debug configuration based on debugger type
    if (DEBUGGER_TYPE === "lldb-dap") {
      // lldb-dap configuration
      debugConfiguration.type = "lldb-dap";
      debugConfiguration.request = "attach";

      // Set the SDK path and module search paths in initCommands
      debugConfiguration.initCommands = sdkPathCommands;
      debugConfiguration.attachCommands = [
        `target create ${targetBasePath}/${debugConfiguration.target}`,
        `gdb-remote ${remoteAddress}`,
      ];

      // TODO: Don't hardcode this path - once the Edge CLI is capable of managing the SDK,
      // this path will be dynamically generated
      // debugConfiguration.debugAdapterExecutable =
      // ("/Library/Developer/Toolchains/swift-6.1-RELEASE.xctoolchain/usr/bin/lldb-dap");
    } else {
      // Default to codelldb configuration
      debugConfiguration.type = "lldb";
      debugConfiguration.request = "launch";

      // Add the current device address to the debug configuration
      debugConfiguration.agent = currentDevice.address;

      // Configure commands for CodeLLDB
      debugConfiguration.targetCreateCommands = [
        `target create ${targetBasePath}/${debugConfiguration.target}`,
        ...sdkPathCommands,
      ];
      debugConfiguration.processCreateCommands = [
        `gdb-remote ${remoteAddress}`,
      ];
    }

    // Ensure we have a preLaunchTask to build the target if not specified
    if (!debugConfiguration.preLaunchTask && debugConfiguration.target) {
      debugConfiguration.preLaunchTask = `edge: Run ${debugConfiguration.target}`;
    }

    // Log configuration to the output channel
    this.outputChannel.appendLine("Resolved debug configuration:");
    this.outputChannel.appendLine(JSON.stringify(debugConfiguration, null, 2));

    return debugConfiguration;
  }

  /**
   * Registers the Edge debug configuration provider with VS Code.
   */
  public static register(
    context: EdgeWorkspaceContext,
    outputChannel: vscode.OutputChannel,
    deviceManager: DeviceManager
  ): vscode.Disposable[] {
    const provider = new EdgeDebugConfigurationProvider(
      outputChannel,
      context.cli,
      context,
      deviceManager
    );

    // Register as both a regular provider (for resolving configurations)
    const regularProvider = vscode.debug.registerDebugConfigurationProvider(
      EDGE_LAUNCH_CONFIG_TYPE,
      provider
    );

    // Also register as a dynamic provider (for showing configurations in the UI)
    const dynamicProvider = vscode.debug.registerDebugConfigurationProvider(
      EDGE_LAUNCH_CONFIG_TYPE,
      provider,
      vscode.DebugConfigurationProviderTriggerKind.Dynamic
    );

    return [regularProvider, dynamicProvider];
  }
}
