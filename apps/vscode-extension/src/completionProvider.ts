import * as vscode from "vscode";
import type { FlagDetector } from "./flagDetector";
import type { DetectedFlag } from "./types";

/**
 * Patterns that trigger flag name completion
 */
const COMPLETION_PATTERNS = [
  // Hook patterns
  /useFeatureFlag(?:<[^>]+>)?\s*\(\s*['"]$/,
  /useFeatureFlagValue(?:<[^>]+>)?\s*\(\s*['"]$/,
  // Component patterns
  /<FeatureFlag(?:<[^>]+>)?\s+[^>]*flag\s*=\s*['"]$/,
  // Generic string in LocalFlag context
  /FeatureFlag.*['"]$/,
];

/**
 * Provides IntelliSense completions for LocalFlag flag names
 */
export class FlagCompletionProvider implements vscode.CompletionItemProvider {
  constructor(private readonly flagDetector: FlagDetector) {}

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionList | vscode.CompletionItem[]> {
    // Get text from line start to cursor position
    const linePrefix = document.lineAt(position).text.substring(0, position.character);

    // Check if we're in a relevant context
    if (!this.shouldProvideCompletions(linePrefix)) {
      return undefined;
    }

    const flags = this.flagDetector.getAllFlags();

    if (flags.length === 0) {
      return undefined;
    }

    const completionItems = flags.map((flag) =>
      this.createCompletionItem(flag)
    );

    return new vscode.CompletionList(completionItems, false);
  }

  /**
   * Check if completions should be provided based on line context
   */
  private shouldProvideCompletions(linePrefix: string): boolean {
    // Check against known patterns
    for (const pattern of COMPLETION_PATTERNS) {
      if (pattern.test(linePrefix)) {
        return true;
      }
    }

    // Also trigger in any string context that follows LocalFlag-related imports
    // This is a fallback for edge cases
    const endsWithOpenQuote = /['"]$/.test(linePrefix);
    const hasLocalFlagContext =
      /useFeatureFlag|FeatureFlag|featureFlags?/i.test(linePrefix);

    return endsWithOpenQuote && hasLocalFlagContext;
  }

  /**
   * Create a completion item for a flag
   */
  private createCompletionItem(flag: DetectedFlag): vscode.CompletionItem {
    const item = new vscode.CompletionItem(
      flag.name,
      vscode.CompletionItemKind.EnumMember
    );

    item.detail = `${flag.type}: ${JSON.stringify(flag.value)}`;

    const documentation = new vscode.MarkdownString();
    documentation.appendMarkdown(`**Type:** \`${flag.type}\`\n\n`);
    documentation.appendMarkdown(`**Default:** \`${JSON.stringify(flag.value)}\`\n\n`);

    if (flag.description) {
      documentation.appendMarkdown(`---\n\n${flag.description}`);
    }

    item.documentation = documentation;

    // Set sort priority (flags appear at top)
    item.sortText = `0_${flag.name}`;

    // Filter text is just the flag name
    item.filterText = flag.name;

    // Insert the flag name (without quotes, as we're inside quotes)
    item.insertText = flag.name;

    return item;
  }
}
