import * as vscode from "vscode";
import * as path from "path";
import { EdgeCLI } from "../edge-cli/edge-cli";
import { EdgeWorkspaceContext } from "../EdgeWorkspaceContext";
import { DeviceManager } from "../models/DeviceManager";
import { getErrorDescription } from "../utilities/utilities";

export const EDGE_LAUNCH_CONFIG_TYPE = "edge";
// Default debug port used by Edge agent
export const DEFAULT_DEBUG_PORT = 4242;

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

    // Set the correct debugger type
    debugConfiguration.type = "lldb-dap";
    debugConfiguration.request = "attach";

    // Add the current device address to the debug configuration
    debugConfiguration.agent = currentDevice.address;

    // Ensure we have a preLaunchTask to build the target if not specified
    if (!debugConfiguration.preLaunchTask && debugConfiguration.target) {
      debugConfiguration.preLaunchTask = `edge: Run ${debugConfiguration.target}`;
    }

    // Check the format of the SDK bundle to ensure we're using the right paths
    const sdkSubPath =
      "swift-6.0.3-RELEASE_static-linux-0.0.1/swift-linux-musl/musl-1.2.5.sdk/aarch64";
    const moduleSubPath =
      "swift-6.0.3-RELEASE_static-linux-0.0.1/swift-linux-musl/musl-1.2.5.sdk/aarch64/usr/lib/swift_static/linux-static";

    // Build debug target path
    const targetBasePath = path.join(
      folder?.uri.fsPath || "",
      ".edge-build/debug"
    );

    // Get the device address and ensure it has the correct debug port
    // TODO: Get port from Run command output instead of hardcoding to 4242
    const remoteAddress = this.ensureDebugPort(currentDevice.address);

    // For remote debugging with GDB protocol using attachCommands (this replaces the standard attach logic)
    // This is critical for EdgeOS debugging as we need custom attach commands
    const attachCommands = [
      // Create the target
      `target create ${targetBasePath}/${debugConfiguration.target}`,

      // Set SDK path
      `settings set target.sdk-path "${path.join(sdkPath, sdkSubPath)}"`,

      // Set Swift module search paths
      `settings set target.swift-module-search-paths "${path.join(
        sdkPath,
        moduleSubPath
      )}"`,

      // Connect to remote GDB server
      `gdb-remote ${remoteAddress}`,
    ];

    // Add attachCommands to the debug configuration
    // According to LLDB DAP docs, these commands replace the standard attach logic
    debugConfiguration.attachCommands = attachCommands;

    // We can still use initCommands for commands that need to run before creating the target
    debugConfiguration.initCommands = [
      // Optional initialization commands
      "settings set plugin.symbol-locator.enable true",
      "settings set target.prefer-dynamic-value run-target",
    ];

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
