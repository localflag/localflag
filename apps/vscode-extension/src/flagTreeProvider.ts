import * as vscode from "vscode";
import * as path from "path";
import type { FlagDetector } from "./flagDetector";
import type { DetectedFlag, FlagDefinition } from "./types";

/**
 * Tree item types for the flag tree view
 */
type FlagTreeItem = FileTreeItem | FlagTreeItemNode;

/**
 * Represents a file containing flag definitions
 */
class FileTreeItem extends vscode.TreeItem {
  constructor(
    public readonly definition: FlagDefinition,
    public readonly workspaceRoot: string
  ) {
    const relativePath = path.relative(workspaceRoot, definition.filePath);
    super(relativePath, vscode.TreeItemCollapsibleState.Expanded);

    this.tooltip = definition.filePath;
    this.description = `${definition.flags.length} flag${definition.flags.length !== 1 ? "s" : ""}`;
    this.iconPath = new vscode.ThemeIcon("file-code");
    this.contextValue = "flagFile";
  }
}

/**
 * Represents a single flag in the tree
 */
class FlagTreeItemNode extends vscode.TreeItem {
  constructor(public readonly flag: DetectedFlag) {
    super(flag.name, vscode.TreeItemCollapsibleState.None);

    this.tooltip = this.buildTooltip();
    this.description = this.buildDescription();
    this.iconPath = this.getIcon();
    this.contextValue = flag.type === "boolean" ? "booleanFlag" : "flag";

    // Command to go to flag definition
    this.command = {
      command: "localflag.goToDefinition",
      title: "Go to Definition",
      arguments: [
        flag.location.filePath,
        flag.location.line,
        flag.location.column,
      ],
    };
  }

  private buildDescription(): string {
    const valueStr =
      typeof this.flag.value === "string"
        ? `"${this.flag.value}"`
        : String(this.flag.value);
    return `${valueStr} (${this.flag.type})`;
  }

  private buildTooltip(): string {
    let tooltip = `${this.flag.name}: ${this.flag.type}`;
    tooltip += `\nValue: ${JSON.stringify(this.flag.value)}`;
    if (this.flag.description) {
      tooltip += `\n\n${this.flag.description}`;
    }
    tooltip += `\n\nClick to go to definition`;
    return tooltip;
  }

  private getIcon(): vscode.ThemeIcon {
    switch (this.flag.type) {
      case "boolean":
        return new vscode.ThemeIcon(
          this.flag.value ? "check" : "close",
          this.flag.value
            ? new vscode.ThemeColor("testing.iconPassed")
            : new vscode.ThemeColor("testing.iconFailed")
        );
      case "number":
        return new vscode.ThemeIcon("symbol-number");
      case "string":
        return new vscode.ThemeIcon("symbol-string");
      default:
        return new vscode.ThemeIcon("symbol-variable");
    }
  }
}

/**
 * Provides tree data for the LocalFlag sidebar view
 */
export class FlagTreeProvider
  implements vscode.TreeDataProvider<FlagTreeItem>
{
  private _onDidChangeTreeData = new vscode.EventEmitter<
    FlagTreeItem | undefined | null | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly flagDetector: FlagDetector) {}

  /**
   * Refresh the tree view
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Get tree item for display
   */
  getTreeItem(element: FlagTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * Get children for a tree element
   */
  getChildren(element?: FlagTreeItem): Thenable<FlagTreeItem[]> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return Promise.resolve([]);
    }

    const workspaceRoot = workspaceFolder.uri.fsPath;

    if (!element) {
      // Root level: return file items
      const definitions = this.flagDetector.getDefinitions();

      if (definitions.length === 0) {
        return Promise.resolve([]);
      }

      return Promise.resolve(
        definitions.map((def) => new FileTreeItem(def, workspaceRoot))
      );
    }

    if (element instanceof FileTreeItem) {
      // File level: return flag items
      return Promise.resolve(
        element.definition.flags.map((flag) => new FlagTreeItemNode(flag))
      );
    }

    return Promise.resolve([]);
  }

  /**
   * Get parent of a tree element (for reveal support)
   */
  getParent(element: FlagTreeItem): FlagTreeItem | null {
    if (element instanceof FlagTreeItemNode) {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        return null;
      }

      const definitions = this.flagDetector.getDefinitions();
      const definition = definitions.find((def) =>
        def.flags.some((f) => f.name === element.flag.name)
      );

      if (definition) {
        return new FileTreeItem(definition, workspaceFolder.uri.fsPath);
      }
    }

    return null;
  }
}
