import * as vscode from 'vscode';

// Forward declare FolderContext to avoid circular dependency
export class FolderContext implements vscode.Disposable {
  dispose(): void;
}

export enum FolderOperation {
  add = "add",
  remove = "remove",
  focus = "focus",
  unfocus = "unfocus", 
  packageUpdated = "packageUpdated",
  resolvedUpdated = "resolvedUpdated",
  workspaceStateUpdated = "workspaceStateUpdated",
  packageViewUpdated = "packageViewUpdated",
  pluginsUpdated = "pluginsUpdated",
}

export enum FileOperation {
  created = "created",
  changed = "changed",
  deleted = "deleted",
}

export interface FolderEvent {
  operation: FolderOperation;
  workspace: WorkspaceContext;
  folder: FolderContext | null;
}

export interface SwiftFileEvent {
  operation: FileOperation;
  uri: vscode.Uri;
}

// interface TestEvent {
//   kind: TestKind;
//   folder: FolderContext;
//   targets: string[];
// }

// interface BuildEvent {
//   targetName: string;
//   launchConfig: vscode.DebugConfiguration;
//   options: vscode.DebugSessionOptions;
// }

export class WorkspaceContext implements vscode.Disposable {
  folders: FolderContext[];
  currentFolder: FolderContext | null | undefined;
  currentDocument: vscode.Uri | null;
  // statusItem: StatusItem;
  // buildStatus: SwiftBuildStatus;
  // languageClientManager: LanguageClientManager;
  // tasks: TaskManager;
  // diagnostics: DiagnosticsManager;
  subscriptions: vscode.Disposable[];
  // documentation: DocumentationManager;
  // tempFolder: TemporaryFolder;
  // outputChannel: SwiftOutputChannel;
  // toolchain: SwiftToolchain;
  
  readonly swiftVersion: string;
  
  // onDidStartTests: vscode.Event<TestEvent>;
  // onDidFinishTests: vscode.Event<TestEvent>;
  // onDidStartBuild: vscode.Event<BuildEvent>;
  // onDidFinishBuild: vscode.Event<BuildEvent>;
  
  // static create(
  //   extensionContext: vscode.ExtensionContext,
  //   outputChannel: SwiftOutputChannel,
  //   toolchain: SwiftToolchain
  // ): Promise<WorkspaceContext>;
  
  dispose(): void;
  // stop(): Promise<void>;
  // updateContextKeys(folderContext: FolderContext | null): void;
  // updateContextKeysForFile(): Promise<void>;
  // updatePluginContextKey(): void;
  // addWorkspaceFolders(): Promise<void>;
  fireEvent(folder: FolderContext | null, operation: FolderOperation): Promise<void>;
  focusFolder(folderContext: FolderContext | null): Promise<void>;
  // testsFinished(folder: FolderContext, kind: TestKind, targets: string[]): void;
  // testsStarted(folder: FolderContext, kind: TestKind, targets: string[]): void;
  // buildStarted(targetName: string, launchConfig: vscode.DebugConfiguration, options: vscode.DebugSessionOptions): void;
  // buildFinished(targetName: string, launchConfig: vscode.DebugConfiguration, options: vscode.DebugSessionOptions): void;
  // onDidChangeWorkspaceFolders(event: vscode.WorkspaceFoldersChangeEvent): Promise<void>;
  // addWorkspaceFolder(workspaceFolder: vscode.WorkspaceFolder): Promise<FolderContext | undefined>;
  // addPackageFolder(folder: vscode.Uri, workspaceFolder: vscode.WorkspaceFolder): Promise<FolderContext>;
  // removeWorkspaceFolder(workspaceFolder: vscode.WorkspaceFolder): Promise<void>;
  onDidChangeFolders(listener: (event: FolderEvent) => unknown): vscode.Disposable;
  onDidChangeSwiftFiles(listener: (event: SwiftFileEvent) => unknown): vscode.Disposable;
  // focusTextEditor(editor?: vscode.TextEditor): Promise<void>;
  // focusUri(uri?: vscode.Uri): Promise<void>;
  // focusPackageUri(uri: vscode.Uri): Promise<void>;
  // isValidWorkspaceFolder(folder: string): Promise<boolean>;
} 
