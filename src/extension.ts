// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DeviceProvider } from './providers/deviceProvider';
import { Device } from './models/device';
import { DocumentationProvider } from './providers/documentationProvider';
import { DeviceDetailsPanel } from './webviews/deviceDetailsPanel';
import { SetupProvider } from './providers/setupProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "edge-developer-extension" is now active!');

	// Create the device provider
	const deviceProvider = new DeviceProvider();

	// Register the tree data provider for the edgeDevices view
	const treeView = vscode.window.registerTreeDataProvider('edgeDevices', deviceProvider);
	context.subscriptions.push(treeView);

	// Create and register the documentation provider
	const documentationProvider = new DocumentationProvider();
	const docTreeView = vscode.window.registerTreeDataProvider('edgeDocumentation', documentationProvider);
	context.subscriptions.push(docTreeView);

	// Create and register the setup provider
	const setupProvider = new SetupProvider();
	const setupTreeView = vscode.window.registerTreeDataProvider('edgeSetup', setupProvider);
	context.subscriptions.push(setupTreeView);

	// Register commands
	const refreshCommand = vscode.commands.registerCommand('edge-developer-extension.refreshDevices', () => {
		deviceProvider.refresh();
		vscode.window.showInformationMessage('Device list refreshed');
	});
	context.subscriptions.push(refreshCommand);

	// Command to add a new device (for demo purposes)
	const addDeviceCommand = vscode.commands.registerCommand('edge-developer-extension.addDevice', async () => {
		const name = await vscode.window.showInputBox({ prompt: 'Enter device name' });
		if (name) {
			const type = await vscode.window.showInputBox({ prompt: 'Enter device type' });
			if (type) {
				const ip = await vscode.window.showInputBox({ prompt: 'Enter device IP address' });
				if (ip) {
					const newDevice: Device = {
						id: Date.now().toString(),
						name,
						type,
						ip,
						port: 22,
						host: `${name.toLowerCase().replace(/\s+/g, '-')}.local`,
						operatingSystem: 'Unknown',
						operatingSystemVersion: 'Unknown'
					};
					deviceProvider.addDevice(newDevice);
					vscode.window.showInformationMessage(`Device ${name} added`);
				}
			}
		}
	});
	context.subscriptions.push(addDeviceCommand);

	// Command to open device details panel
	const openDeviceDetailsCommand = vscode.commands.registerCommand('edge-developer-extension.openDeviceDetails', (device: Device) => {
		DeviceDetailsPanel.createOrShow(context.extensionUri, device);
	});
	context.subscriptions.push(openDeviceDetailsCommand);

	// Device action commands
	const runAppCommand = vscode.commands.registerCommand('edge-developer-extension.runApp', (item) => {
		vscode.window.showInformationMessage(`Running app on ${item.device.name}`);
	});
	context.subscriptions.push(runAppCommand);

	const stopAppCommand = vscode.commands.registerCommand('edge-developer-extension.stopApp', (item) => {
		vscode.window.showInformationMessage(`Stopping app on ${item.device.name}`);
	});
	context.subscriptions.push(stopAppCommand);

	const debugAppCommand = vscode.commands.registerCommand('edge-developer-extension.debugApp', (item) => {
		vscode.window.showInformationMessage(`Debugging app on ${item.device.name}`);
	});
	context.subscriptions.push(debugAppCommand);

	const attachDebuggerCommand = vscode.commands.registerCommand('edge-developer-extension.attachDebugger', (item) => {
		vscode.window.showInformationMessage(`Attaching debugger to ${item.device.name}`);
	});
	context.subscriptions.push(attachDebuggerCommand);

	// Command to open documentation links
	const openDocumentationCommand = vscode.commands.registerCommand('edge-developer-extension.openDocumentation', (url: string) => {
		vscode.env.openExternal(vscode.Uri.parse(url));
	});
	context.subscriptions.push(openDocumentationCommand);

	// Setup commands
	const setupVSCodeCommand = vscode.commands.registerCommand('edge-developer-extension.setupVSCode', async () => {
		await setupVSCodeFolder();
	});
	context.subscriptions.push(setupVSCodeCommand);

	const setupTasksJsonCommand = vscode.commands.registerCommand('edge-developer-extension.setupTasksJson', async () => {
		await setupTasksJson();
	});
	context.subscriptions.push(setupTasksJsonCommand);

	const setupLaunchJsonCommand = vscode.commands.registerCommand('edge-developer-extension.setupLaunchJson', async () => {
		await setupLaunchJson();
	});
	context.subscriptions.push(setupLaunchJsonCommand);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('edge-developer-extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Edge Developer Extension!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

// Setup .vscode folder with both tasks.json and launch.json
async function setupVSCodeFolder(): Promise<void> {
	try {
		// Get the workspace folder
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			vscode.window.showErrorMessage('No workspace folder found. Please open a folder first.');
			return;
		}

		// Create .vscode folder if it doesn't exist
		const vscodeDir = path.join(workspaceFolder.uri.fsPath, '.vscode');
		if (!fs.existsSync(vscodeDir)) {
			fs.mkdirSync(vscodeDir);
		}

		// Setup both files
		await setupTasksJson();
		await setupLaunchJson();

		vscode.window.showInformationMessage('.vscode folder setup complete with tasks.json and launch.json');
	} catch (error) {
		vscode.window.showErrorMessage(`Error setting up .vscode folder: ${error}`);
	}
}

// Setup tasks.json
async function setupTasksJson(): Promise<void> {
	try {
		// Get the workspace folder
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			vscode.window.showErrorMessage('No workspace folder found. Please open a folder first.');
			return;
		}

		// Create .vscode folder if it doesn't exist
		const vscodeDir = path.join(workspaceFolder.uri.fsPath, '.vscode');
		if (!fs.existsSync(vscodeDir)) {
			fs.mkdirSync(vscodeDir);
		}

		// Create tasks.json
		const tasksJsonPath = path.join(vscodeDir, 'tasks.json');
		const tasksJson = {
			"version": "2.0.0",
			"tasks": [
				{
					"label": "Deploy to Edge Device",
					"type": "shell",
					"command": "rsync -avz --exclude 'node_modules' --exclude '.git' ${workspaceFolder}/ edge-device:/home/edge/app/",
					"problemMatcher": [],
					"presentation": {
						"reveal": "always",
						"panel": "new"
					},
					"group": {
						"kind": "build",
						"isDefault": true
					}
				},
				{
					"label": "Run on Edge Device",
					"type": "shell",
					"command": "ssh edge-device 'cd /home/edge/app && npm start'",
					"problemMatcher": [],
					"presentation": {
						"reveal": "always",
						"panel": "new"
					}
				},
				{
					"label": "Stop App on Edge Device",
					"type": "shell",
					"command": "ssh edge-device 'pkill -f \"node /home/edge/app\" || true'",
					"problemMatcher": [],
					"presentation": {
						"reveal": "always",
						"panel": "new"
					}
				}
			]
		};

		fs.writeFileSync(tasksJsonPath, JSON.stringify(tasksJson, null, 2));
		vscode.window.showInformationMessage('tasks.json has been set up successfully.');
	} catch (error) {
		vscode.window.showErrorMessage(`Error setting up tasks.json: ${error}`);
	}
}

// Setup launch.json
async function setupLaunchJson(): Promise<void> {
	try {
		// Get the workspace folder
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			vscode.window.showErrorMessage('No workspace folder found. Please open a folder first.');
			return;
		}

		// Create .vscode folder if it doesn't exist
		const vscodeDir = path.join(workspaceFolder.uri.fsPath, '.vscode');
		if (!fs.existsSync(vscodeDir)) {
			fs.mkdirSync(vscodeDir);
		}

		// Create launch.json
		const launchJsonPath = path.join(vscodeDir, 'launch.json');
		const launchJson = {
			"version": "0.2.0",
			"configurations": [
				{
					"type": "node",
					"request": "launch",
					"name": "Debug on Edge Device",
					"preLaunchTask": "Deploy to Edge Device",
					"address": "edge-device",
					"port": 9229,
					"localRoot": "${workspaceFolder}",
					"remoteRoot": "/home/edge/app",
					"skipFiles": [
						"<node_internals>/**"
					]
				},
				{
					"type": "node",
					"request": "attach",
					"name": "Attach to Edge Device",
					"address": "edge-device",
					"port": 9229,
					"localRoot": "${workspaceFolder}",
					"remoteRoot": "/home/edge/app",
					"skipFiles": [
						"<node_internals>/**"
					]
				}
			]
		};

		fs.writeFileSync(launchJsonPath, JSON.stringify(launchJson, null, 2));
		vscode.window.showInformationMessage('launch.json has been set up successfully.');
	} catch (error) {
		vscode.window.showErrorMessage(`Error setting up launch.json: ${error}`);
	}
}
