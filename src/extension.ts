// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getErrorDescription } from "./utilities/utilities";
import { EdgeCLI } from "./edge-cli/edge-cli";
import type { SwiftExtensionApi } from "swiftlang.swift-vscode";
import { EdgeWorkspaceContext } from "./EdgeWorkspaceContext";
import { EdgeTaskProvider } from "./tasks/EdgeTaskProvider";
import { DocumentationProvider } from "./sidebar/DocumentationProvider";

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

    // Register the documentation provider
    const documentationProvider = new DocumentationProvider();
    vscode.window.registerTreeDataProvider(
      "edgeDocumentation",
      documentationProvider
    );

    const swiftExtension = vscode.extensions.getExtension<SwiftExtensionApi>(
      "swiftlang.swift-vscode"
    );
    if (!swiftExtension) {
      throw new Error("Swift extension not found");
    }

    const swiftVersion = swiftExtension.packageJSON.version;
    outputChannel.appendLine(`Swift extension version: ${swiftVersion}`);

    const swiftAPI = await swiftExtension.activate();
    outputChannel.appendLine(`Swift API: ${swiftAPI}`);

    if (!swiftAPI.workspaceContext) {
      throw new Error("Swift API workspace context not found");
    }

    // Subscribe to folder changes in the Swift workspace context
    const folderChangeDisposable = swiftAPI.workspaceContext.onDidChangeFolders(
      ({ folder, operation }) => {
        outputChannel.appendLine(`Swift folder change detected: ${operation}`);
        if (folder) {
          outputChannel.appendLine(`Folder: ${folder}`);
        }
      }
    );
    context.subscriptions.push(folderChangeDisposable);
    outputChannel.appendLine("Listening for Swift folder changes...");

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
    outputChannel.appendLine(`Edge CLI version: ${edgeCLI.version}`);

    // Create the EdgeWorkspaceContext with all the necessary components
    const edgeWorkspaceContext = new EdgeWorkspaceContext(
      context,
      outputChannel,
      edgeCLI,
      swiftAPI.workspaceContext
    );

    // Store the EdgeWorkspaceContext in the extension context for later use
    context.subscriptions.push(edgeWorkspaceContext);
    context.subscriptions.push(EdgeTaskProvider.register(edgeWorkspaceContext));

    outputChannel.appendLine("EdgeOS extension activated successfully.");
  } catch (error) {
    const errorMessage = getErrorDescription(error);
    vscode.window.showErrorMessage(
      `Activating Edge extension failed: ${errorMessage}`
    );
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
