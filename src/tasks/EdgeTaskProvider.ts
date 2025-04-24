import * as vscode from "vscode";
import type * as Swift from "swiftlang.swift-vscode";
import { EdgeWorkspaceContext } from "../EdgeWorkspaceContext";
import { EdgeFolderContext } from "../EdgeFolderContext";

export const EDGE_TASK_TYPE = "edge";

// This should match the TaskConfig interface in package.json
interface TaskConfig extends vscode.TaskDefinition {
  cwd: vscode.Uri;
  args: string[];
}

export class EdgeTaskProvider implements vscode.TaskProvider {
  constructor(private workspaceContext: EdgeWorkspaceContext) {}

  async provideTasks(token: vscode.CancellationToken): Promise<vscode.Task[]> {
    const tasks: vscode.Task[] = [];

    for (const folderContext of this.workspaceContext.folders) {
      const executableProducts = await folderContext.swift.swiftPackage
        .executableProducts;
      for (const product of executableProducts) {
        tasks.push(...this.createRunTasks(product, folderContext));
      }
    }

    return tasks;
  }

  createRunTasks(
    product: Swift.Product,
    folderContext: EdgeFolderContext
  ): vscode.Task[] {
    const config: TaskConfig = {
      type: EDGE_TASK_TYPE,
      args: ["run", product.name],
      cwd: folderContext.swift.folder,
    };

    // Quote each argument and join them with spaces
    const quotedArgs = config.args.map((arg) => `"${arg}"`).join(" ");

    const task = new vscode.Task(
      config,
      vscode.TaskScope.Workspace,
      `Edge: Run ${product.name}`,
      "edge",
      new vscode.ShellExecution(`edge ${quotedArgs}`, {
        cwd: config.cwd.fsPath,
      })
    );
    task.group = vscode.TaskGroup.Build;

    return [task];
  }

  async resolveTask(
    task: vscode.Task,
    token: vscode.CancellationToken
  ): Promise<vscode.Task> {
    return task;
  }

  /**
   * Registers the Edge task provider with VS Code.
   * @param context
   */
  public static register(context: EdgeWorkspaceContext): vscode.Disposable {
    const provider = new EdgeTaskProvider(context);
    return vscode.tasks.registerTaskProvider(EDGE_TASK_TYPE, provider);
  }
}
