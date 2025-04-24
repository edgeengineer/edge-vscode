import * as vscode from "vscode";

declare module "swiftlang.swift-vscode" {
  export interface Product {
    name: string;
    targets: string[];
    type: { executable?: null; library?: string[] };
  }

  export interface Target {
    name: string;
    c99name: string;
    path: string;
    sources: string[];
    type: "executable" | "test" | "library" | "snippet" | "plugin";
  }

  export interface Dependency {
    identity: string;
    type?: string;
    requirement?: object;
    url?: string;
    path?: string;
    dependencies: Dependency[];
  }

  export interface ResolvedDependency extends Dependency {
    version: string;
  }

  export interface PackageResolvedPinState {
    branch: string | null;
    revision: string;
    version: string | null;
  }

  export class PackageResolvedPin {
    readonly identity: string;
    readonly location: string;
    readonly state: PackageResolvedPinState;

    constructor(
      identity: string,
      location: string,
      state: PackageResolvedPinState
    );
  }

  export class PackageResolved {
    readonly fileHash: number;
    readonly pins: PackageResolvedPin[];
    readonly version: number;

    constructor(fileContents: string);
    identity(url: string): string;
  }

  export interface WorkspaceState {
    object: { dependencies: any[] }; // WorkspaceStateDependency
    version: number;
  }

  export class SwiftPackage {
    readonly folder: vscode.Uri;
    plugins: any[]; // PackagePlugin[]
    resolved: PackageResolved | undefined;

    static create(folder: vscode.Uri, toolchain: any): Promise<SwiftPackage>;

    reload(toolchain: any): Promise<void>;
    reloadPackageResolved(): Promise<void>;
    reloadWorkspaceState(): Promise<void>;
    loadSwiftPlugins(toolchain: any, outputChannel: any): Promise<void>;

    get isValid(): Promise<boolean>;
    get error(): Promise<Error | undefined>;
    get foundPackage(): Promise<boolean>;
    get rootDependencies(): Promise<ResolvedDependency[]>;
    get executableProducts(): Promise<Product[]>;

    childDependencies(dependency: Dependency): ResolvedDependency[];
    getTargets(type?: string): Promise<Target[]>;
    getTarget(file: string): Promise<Target | undefined>;
  }

  // Forward declare FolderContext for export
  export class FolderContext implements vscode.Disposable {
    folder: vscode.Uri;
    linuxMain: any; // LinuxMain
    swiftPackage: SwiftPackage;
    workspaceFolder: vscode.WorkspaceFolder;
    workspaceContext: WorkspaceContext;
    backgroundCompilation: any; // BackgroundCompilation
    hasResolveErrors: boolean;
    testExplorer?: any; // TestExplorer
    taskQueue: any; // TaskQueue
    readonly relativePath: string;
    readonly name: string;
    readonly isRootFolder: boolean;

    dispose(): void;
    editedPackageFolder(identifier: string): void;
    addTestExplorer(): void;
    removeTestExplorer(): void;
    refreshTestExplorer(): void;
    hasTestExplorer(): boolean;

    static uriName(uri: vscode.Uri): string;
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

  export class WorkspaceContext implements vscode.Disposable {
    folders: FolderContext[];
    currentFolder: FolderContext | null | undefined;
    currentDocument: vscode.Uri | null;
    subscriptions: vscode.Disposable[];

    readonly swiftVersion: string;

    dispose(): void;
    fireEvent(
      folder: FolderContext | null,
      operation: FolderOperation
    ): Promise<void>;
    focusFolder(folderContext: FolderContext | null): Promise<void>;
    onDidChangeFolders(
      listener: (event: FolderEvent) => unknown
    ): vscode.Disposable;
    onDidChangeSwiftFiles(
      listener: (event: SwiftFileEvent) => unknown
    ): vscode.Disposable;
  }

  /**
   * API interface for the Swift VSCode extension
   */
  export interface SwiftExtensionApi {
    workspaceContext?: WorkspaceContext;
    // outputChannel: SwiftOutputChannel;
    activate(): Promise<SwiftExtensionApi>;
    deactivate(): Promise<void>;
  }
}
