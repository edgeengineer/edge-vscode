import type { WorkspaceContext } from './WorkspaceContext';

/**
 * API interface for the Swift VSCode extension
 */
export interface SwiftExtensionApi {
  workspaceContext?: WorkspaceContext;
  // outputChannel: SwiftOutputChannel;
  activate(): Promise<SwiftExtensionApi>;
  deactivate(): Promise<void>;
}
