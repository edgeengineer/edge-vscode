// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getErrorDescription } from "./utilities/utilities";
import { EdgeCLI } from "./edge-cli/edge-cli";

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  try {
    const outputChannel = vscode.window.createOutputChannel("EdgeOS");
    context.subscriptions.push(outputChannel);
    outputChannel.appendLine(
      "Activating EdgeOS extension for Visual Studio Code..."
    );

    // If we're developing the extension, focus the output channel
    if (context.extensionMode === vscode.ExtensionMode.Development) {
      outputChannel.show();
    }

    const swiftExtension = vscode.extensions.getExtension(
      "swiftlang.swift-vscode"
    );
    if (!swiftExtension) {
      throw new Error("Swift extension not found");
    }

    const swiftVersion = swiftExtension.packageJSON.version;
    outputChannel.appendLine(`Swift extension version: ${swiftVersion}`);

    const swiftAPI = await swiftExtension.activate();
    outputChannel.appendLine(`Swift API: ${swiftAPI}`);

    const edgeCLI = await EdgeCLI.create();
    if (!edgeCLI) {
      const choice = await vscode.window.showErrorMessage(
        "Unable to autmoatically discover your Edge CLI installation.",
        "View Installation Instructions"
      );
      if (choice === "View Installation Instructions") {
        vscode.env.openExternal(
          vscode.Uri.parse(
            "https://github.com/apache-edge/edge-agent/blob/main/README.md"
          )
        );
      }
      return;
    }

    outputChannel.appendLine(`Discovered Edge CLI at path: ${edgeCLI.path}`);
  } catch (error) {
    const errorMessage = getErrorDescription(error);
    vscode.window.showErrorMessage(
      `Activating Edge extension failed: ${errorMessage}`
    );
  }
}

async function createEdgeCLI(
  outputChannel: vscode.OutputChannel
): Promise<EdgeCLI | undefined> {
  try {
    return await EdgeCLI.create();
  } catch (error) {
    outputChannel.appendLine(
      `Failed to create Edge CLI: ${getErrorDescription(error)}`
    );
    return undefined;
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
