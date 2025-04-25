import * as vscode from "vscode";
import { EdgeCLI } from "./edge-cli/edge-cli";
import { EdgeFolderContext } from "./EdgeFolderContext";
// Import only types, not the actual implementation
import type * as Swift from "swiftlang.swift-vscode";

// Define the enum values as constants since we can't use the imported types at runtime
const FolderOperation = {
  add: "add",
  remove: "remove",
  focus: "focus",
  unfocus: "unfocus",
  packageUpdated: "packageUpdated",
  resolvedUpdated: "resolvedUpdated",
  workspaceStateUpdated: "workspaceStateUpdated",
  packageViewUpdated: "packageViewUpdated",
  pluginsUpdated: "pluginsUpdated",
} as const;

// This type helps us ensure our locally defined FolderOperation
// matches the imported Swift.FolderOperation
// If the Swift API changes in the future, TypeScript will show errors at compile time
type VerifyFolderOperation = Record<Swift.FolderOperation, string>;
// This will cause a compile-time error if our FolderOperation doesn't
// contain all the keys from Swift.FolderOperation
const _typeCheck: VerifyFolderOperation = FolderOperation;

export class EdgeWorkspaceContext implements vscode.Disposable {
  public folders: EdgeFolderContext[] = [];
  private _onDidChangePackage = new vscode.EventEmitter<EdgeFolderContext>();
  public readonly onDidChangePackage = this._onDidChangePackage.event;

  constructor(
    public readonly context: vscode.ExtensionContext,
    public readonly output: vscode.OutputChannel,
    public readonly cli: EdgeCLI,
    public readonly swift: Swift.WorkspaceContext
  ) {
    // Subscribe to Swift workspace events
    context.subscriptions.push(
      this.swift.onDidChangeFolders((event) => this.handleFolderEvent(event))
    );
  }

  dispose(): void {
    this.folders.forEach((folder) => folder.dispose());
    this.folders.length = 0;
    this._onDidChangePackage.dispose();
  }

  /**
   * Ensure we have an EdgeFolderContext for the given Swift folder context.
   * @param folder
   * @returns Either the existing EdgeFolderContext or a new one.
   */
  private getOrCreateFolderContext(
    folder: Swift.FolderContext
  ): EdgeFolderContext {
    // Check if we already have a context for this folder
    const existingFolder = this.folders.find((f) => f.swift === folder);

    if (existingFolder) {
      return existingFolder;
    }

    // Create a new context if one doesn't exist
    const newFolder = new EdgeFolderContext(folder, this);
    this.folders.push(newFolder);
    return newFolder;
  }

  private async handleFolderEvent({
    operation,
    workspace,
    folder,
  }: Swift.FolderEvent) {
    if (!folder) {
      return;
    }

    switch (operation) {
      case FolderOperation.add:
      case FolderOperation.packageUpdated: {
        // Ensure we have an EdgeFolderContext for the folder
        const edgeFolder = this.getOrCreateFolderContext(folder);

        // Emit an event indicating the package was updated
        this._onDidChangePackage.fire(edgeFolder);

        // Refresh debug configurations
        this.refreshDebugConfigurations();

        break;
      }
      case FolderOperation.remove: {
        // Clean up the EdgeFolderContext for the removed folder
        const edgeFolder = this.folders.find((f) => f.swift === folder);
        if (edgeFolder) {
          edgeFolder.dispose();
          this.folders.splice(this.folders.indexOf(edgeFolder), 1);

          // Refresh debug configurations after removing a folder
          this.refreshDebugConfigurations();
        }
        break;
      }
      default: {
        // Skip other operations
        return;
      }
    }
  }

  /**
   * Refresh the debug configurations in VS Code
   */
  private refreshDebugConfigurations(): void {
    vscode.commands.executeCommand("edge.refreshDebugConfigurations");

    this.output.appendLine(
      "Swift package updated, refreshing debug configurations"
    );
  }
}
