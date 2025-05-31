import * as vscode from "vscode";
import type * as Swift from "swiftlang.swift-vscode";
import { EdgeWorkspaceContext } from "../EdgeWorkspaceContext";
import { EdgeFolderContext } from "../EdgeFolderContext";
import { DeviceManager } from "../models/DeviceManager";
import { EdgeCLI } from "../edge-cli/edge-cli";
import * as cp from "child_process";

export const EDGE_TASK_TYPE = "edge";

// This should match the TaskConfig interface in package.json
interface TaskConfig extends vscode.TaskDefinition {
  cwd: vscode.Uri;
  args: string[];
}

/**
 * Custom terminal for executing Edge CLI tasks
 */
class EdgeTaskTerminal implements vscode.Pseudoterminal {
  private writeEmitter = new vscode.EventEmitter<string>();
  onDidWrite: vscode.Event<string> = this.writeEmitter.event;

  private closeEmitter = new vscode.EventEmitter<number>();
  onDidClose: vscode.Event<number> = this.closeEmitter.event;

  private process: cp.ChildProcess | undefined;

  constructor(
    private readonly cli: EdgeCLI,
    private readonly args: string[],
    private readonly cwd: string
  ) {}

  open(): void {
    this.writeEmitter.fire(
      `> Executing: ${this.cli.path} ${this.args.join(" ")}\r\n`
    );

    this.process = cp.spawn(this.cli.path, this.args, {
      cwd: this.cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    this.process.stdout?.on("data", (data) => {
      this.writeEmitter.fire(data.toString());
    });

    this.process.stderr?.on("data", (data) => {
      this.writeEmitter.fire(data.toString());
    });

    this.process.on("close", (code) => {
      this.writeEmitter.fire(`\r\nEdge process exited with code ${code}\r\n`);
      this.closeEmitter.fire(code || 0);
    });

    this.process.on("error", (err) => {
      this.writeEmitter.fire(`\r\nError: ${err.message}\r\n`);
      this.closeEmitter.fire(1);
    });
  }

  close(): void {
    if (this.process) {
      this.process.kill();
      this.process = undefined;
    }
  }
}

export class EdgeTaskProvider implements vscode.TaskProvider {
  private deviceManager: DeviceManager;
  private edgeCLI: EdgeCLI;

  constructor(
    private workspaceContext: EdgeWorkspaceContext,
    deviceManager?: DeviceManager
  ) {
    // The device manager can be injected for testing, or we'll create one
    this.deviceManager = deviceManager || new DeviceManager();
    this.edgeCLI = workspaceContext.cli;
  }

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
      args: ["run", "--detach", product.name],
      cwd: folderContext.swift.folder,
    };

    const task = new vscode.Task(
      config,
      vscode.TaskScope.Workspace,
      `Run ${product.name}`,
      "edge",
      new vscode.CustomExecution(
        async (
          resolvedDefinition: vscode.TaskDefinition
        ): Promise<vscode.Pseudoterminal> => {
          // Clone the args array
          const args = [...config.args];

          // Add --agent parameter if there's a current device
          const currentDevice = await this.deviceManager.getCurrentDevice();
          if (currentDevice) {
            args.push("--agent", currentDevice.address);
          }

          const runtime = vscode.workspace.getConfiguration("edgeos").get<string>("runtime");
          if(runtime) {
            args.push("--runtime", runtime);
          }

          // Add --debug parameter for debugging
          args.push("--debug");

          return new EdgeTaskTerminal(this.edgeCLI, args, config.cwd.fsPath);
        }
      )
    );

    task.group = vscode.TaskGroup.Build;
    return [task];
  }

  async resolveTask(
    task: vscode.Task,
    token: vscode.CancellationToken
  ): Promise<vscode.Task> {
    // Only handle our own task type
    if (task.definition.type !== EDGE_TASK_TYPE) {
      return task;
    }

    const definition = task.definition as TaskConfig;

    return new vscode.Task(
      definition,
      task.scope || vscode.TaskScope.Workspace,
      task.name,
      task.source,
      new vscode.CustomExecution(
        async (
          resolvedDefinition: vscode.TaskDefinition
        ): Promise<vscode.Pseudoterminal> => {
          // Clone the args array
          const args = [...definition.args];

          // Add --agent parameter if there's a current device
          const currentDevice = await this.deviceManager.getCurrentDevice();
          if (currentDevice) {
            args.push("--agent", currentDevice.address);
          }

          // Add --debug parameter for debugging
          args.push("--debug");

          return new EdgeTaskTerminal(
            this.edgeCLI,
            args,
            definition.cwd.fsPath
          );
        }
      ),
      task.problemMatchers
    );
  }

  /**
   * Registers the Edge task provider with VS Code.
   * @param context
   */
  public static register(
    context: EdgeWorkspaceContext,
    deviceManager?: DeviceManager
  ): vscode.Disposable {
    const provider = new EdgeTaskProvider(context, deviceManager);
    return vscode.tasks.registerTaskProvider(EDGE_TASK_TYPE, provider);
  }
}
