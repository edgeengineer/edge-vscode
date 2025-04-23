import * as vscode from 'vscode';
// import { LinuxMain } from './LinuxMain';
// import { SwiftPackage } from './SwiftPackage';
import { WorkspaceContext, FolderOperation } from './WorkspaceContext';
// import { BackgroundCompilation } from './BackgroundCompilation';
// import { TaskQueue } from './TaskQueue';
// import { TestExplorer } from './TestExplorer';
// import { SwiftOutputChannel } from './SwiftOutputChannel';

export interface EditedPackage {
  name: string;
  folder: string;
}

/**
 * FolderContext provides context for a single folder containing a Swift package
 */
export class FolderContext implements vscode.Disposable {
  folder: vscode.Uri;
  // linuxMain: LinuxMain;
  // swiftPackage: SwiftPackage;
  workspaceFolder: vscode.WorkspaceFolder;
  workspaceContext: WorkspaceContext;
  // backgroundCompilation: BackgroundCompilation;
  hasResolveErrors: boolean;
  // testExplorer?: TestExplorer;
  // taskQueue: TaskQueue;
  
  readonly name: string;
  readonly relativePath: string;
  readonly isRootFolder: boolean;
  
  static create(
    folder: vscode.Uri,
    workspaceFolder: vscode.WorkspaceFolder,
    workspaceContext: WorkspaceContext
  ): Promise<FolderContext>;
  
  dispose(): void;
  reload(): Promise<void>;
  reloadPackageResolved(): Promise<void>;
  reloadWorkspaceState(): Promise<void>;
  // loadSwiftPlugins(outputChannel: SwiftOutputChannel): Promise<void>;
  fireEvent(event: FolderOperation): Promise<void>;
  editedPackageFolder(identifier: string): string;
  // addTestExplorer(): TestExplorer;
  // removeTestExplorer(): void;
  // refreshTestExplorer(): void;
  hasTestExplorer(): boolean;
} 
