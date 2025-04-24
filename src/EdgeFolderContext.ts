import * as vscode from "vscode";
import { EdgeWorkspaceContext } from "./EdgeWorkspaceContext";
import type * as Swift from "swiftlang.swift-vscode";

export class EdgeFolderContext implements vscode.Disposable {
  constructor(
    public readonly swift: Swift.FolderContext,
    public readonly workspaceContext: EdgeWorkspaceContext
  ) {}

  dispose() {}
}
