import * as vscode from 'vscode';

export class SetupItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly command: vscode.Command
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.contextValue = 'setupItem';
        this.command = command;
    }
}

export class SetupProvider implements vscode.TreeDataProvider<SetupItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<SetupItem | undefined | null | void> = new vscode.EventEmitter<SetupItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<SetupItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor() {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: SetupItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: SetupItem): Thenable<SetupItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            // Return setup items
            return Promise.resolve([
                new SetupItem('Setup .vscode', {
                    command: 'edge-developer-extension.setupVSCode',
                    title: 'Setup .vscode folder',
                    arguments: []
                }),
                new SetupItem('Setup only tasks.json', {
                    command: 'edge-developer-extension.setupTasksJson',
                    title: 'Setup tasks.json',
                    arguments: []
                }),
                new SetupItem('Setup only launch.json', {
                    command: 'edge-developer-extension.setupLaunchJson',
                    title: 'Setup launch.json',
                    arguments: []
                })
            ]);
        }
    }
}
