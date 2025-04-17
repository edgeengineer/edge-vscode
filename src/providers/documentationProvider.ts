import * as vscode from 'vscode';

export class DocumentationItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly url: string,
        public readonly iconId: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `Open ${label}`;
        this.command = {
            command: 'edge-developer-extension.openDocumentation',
            title: 'Open Documentation',
            arguments: [url]
        };
        this.iconPath = new vscode.ThemeIcon(iconId);
        this.contextValue = 'documentationLink';
    }
}

export class DocumentationProvider implements vscode.TreeDataProvider<DocumentationItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<DocumentationItem | undefined | null | void> = new vscode.EventEmitter<DocumentationItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DocumentationItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private documentationLinks: DocumentationItem[] = [
        new DocumentationItem(
            'Visit Documentation Website',
            'https://edge.apache.org/docs',
            'book'
        ),
        new DocumentationItem(
            'Visit GitHub',
            'https://github.com/apache/edge',
            'github'
        ),
        new DocumentationItem(
            'Visit Forums',
            'https://edge.apache.org/forums',
            'comment-discussion'
        ),
        new DocumentationItem(
            'Visit Support',
            'https://edge.apache.org/support',
            'question'
        )
    ];

    constructor() {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: DocumentationItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: DocumentationItem): Thenable<DocumentationItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            return Promise.resolve(this.documentationLinks);
        }
    }
}
