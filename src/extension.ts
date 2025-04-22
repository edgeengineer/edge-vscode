// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getErrorDescription } from "./utilities/utilities";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  try {
    const outputChannel = vscode.window.createOutputChannel("EdgeOS");
    context.subscriptions.push(outputChannel);
    outputChannel.appendLine("Activating EdgeOS extension for Visual Studio Code...");

    // If we're developing the extension, focus the output channel
    if (context.extensionMode === vscode.ExtensionMode.Development) {
      outputChannel.show();
    }
  } catch (error) {
    const errorMessage = getErrorDescription(error);
    vscode.window.showErrorMessage(
      `Activating Edge extension failed: ${errorMessage}`
    );
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
