// Portions of this code taken from the VS Code Swift open source project
// (https://github.com/vscode‑swift), licensed under Apache 2.0.

import type * as Swift from "swiftlang.swift-vscode";
import * as path from "path";

/**
 * This function is copied from vscode-swift.
 */
export function getFolderAndNameSuffix(
  ctx: Swift.FolderContext,
  expandEnvVariables = false,
  platform?: "posix" | "win32"
): { folder: string; nameSuffix: string } {
  const nodePath =
    platform === "posix"
      ? path.posix
      : platform === "win32"
      ? path.win32
      : path;
  const workspaceFolder = expandEnvVariables
    ? ctx.workspaceFolder.uri.fsPath
    : `\${workspaceFolder:${ctx.workspaceFolder.name}}`;
  let folder: string;
  let nameSuffix: string;
  if (ctx.relativePath.length === 0) {
    folder = workspaceFolder;
    nameSuffix = "";
  } else {
    folder = nodePath.join(workspaceFolder, ctx.relativePath);
    nameSuffix = ` (${ctx.relativePath})`;
  }
  return { folder: folder, nameSuffix: nameSuffix };
}
