import * as vscode from "vscode";
import { FlagDetector } from "./flagDetector";
import { FlagTreeProvider } from "./flagTreeProvider";
import { FlagCompletionProvider } from "./completionProvider";
import type { DetectedFlag, LocalFlagConfig } from "./types";

let flagDetector: FlagDetector;
let treeProvider: FlagTreeProvider;

/**
 * Get extension configuration
 */
function getConfig(): LocalFlagConfig {
  const config = vscode.workspace.getConfiguration("localflag");
  return {
    flagFilePatterns: config.get<string[]>("flagFilePatterns") || [
      "**/flags.ts",
      "**/flags.config.ts",
      "**/*.flags.ts",
    ],
  };
}

/**
 * Extension activation
 */
export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  console.log("LocalFlag extension is now active");

  const config = getConfig();

  // Initialize flag detector
  flagDetector = new FlagDetector(config.flagFilePatterns);

  // Initialize tree provider
  treeProvider = new FlagTreeProvider(flagDetector);

  // Register tree view
  const treeView = vscode.window.createTreeView("localflag-flags", {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });

  // Register refresh command
  const refreshCommand = vscode.commands.registerCommand(
    "localflag.refresh",
    async () => {
      await flagDetector.refresh();
      treeProvider.refresh();
    }
  );

  // Register go to definition command
  const goToDefinitionCommand = vscode.commands.registerCommand(
    "localflag.goToDefinition",
    async (filePath: string, line: number, column: number) => {
      const uri = vscode.Uri.file(filePath);
      const position = new vscode.Position(line - 1, column);
      const document = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(document);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(
        new vscode.Range(position, position),
        vscode.TextEditorRevealType.InCenter
      );
    }
  );

  // Register toggle flag command
  const toggleFlagCommand = vscode.commands.registerCommand(
    "localflag.toggleFlag",
    async (item: { flag?: DetectedFlag }) => {
      if (!item?.flag || item.flag.type !== "boolean") {
        vscode.window.showWarningMessage("Only boolean flags can be toggled");
        return;
      }

      const success = await flagDetector.toggleBooleanFlag(item.flag);
      if (success) {
        await flagDetector.refresh();
        treeProvider.refresh();
      } else {
        vscode.window.showErrorMessage(`Failed to toggle flag: ${item.flag.name}`);
      }
    }
  );

  // Register completion provider for TypeScript and TypeScript React
  const completionProvider = new FlagCompletionProvider(flagDetector);
  const completionDisposable = vscode.languages.registerCompletionItemProvider(
    [
      { language: "typescript", scheme: "file" },
      { language: "typescriptreact", scheme: "file" },
    ],
    completionProvider,
    "'",
    '"'
  );

  // Watch for file changes in flag files
  const fileWatcher = vscode.workspace.createFileSystemWatcher(
    "**/{flags,*.flags,flags.config}.ts"
  );

  fileWatcher.onDidChange(async () => {
    await flagDetector.refresh();
    treeProvider.refresh();
  });

  fileWatcher.onDidCreate(async () => {
    await flagDetector.refresh();
    treeProvider.refresh();
  });

  fileWatcher.onDidDelete(async () => {
    await flagDetector.refresh();
    treeProvider.refresh();
  });

  // Watch for configuration changes
  const configWatcher = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("localflag")) {
      const newConfig = getConfig();
      flagDetector.updatePatterns(newConfig.flagFilePatterns);
      flagDetector.refresh().then(() => treeProvider.refresh());
    }
  });

  // Register all disposables
  context.subscriptions.push(
    treeView,
    refreshCommand,
    goToDefinitionCommand,
    toggleFlagCommand,
    completionDisposable,
    fileWatcher,
    configWatcher
  );

  // Initial scan
  await flagDetector.refresh();
  treeProvider.refresh();
}

/**
 * Extension deactivation
 */
export function deactivate(): void {
  console.log("LocalFlag extension is now deactivated");
}
