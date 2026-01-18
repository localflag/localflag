import * as vscode from "vscode";
import * as ts from "typescript";
import type {
  DetectedFlag,
  FlagDefinition,
  FlagLocation,
  FlagPattern,
} from "./types";

/**
 * Detects feature flags in TypeScript files using the TypeScript Compiler API
 */
export class FlagDetector {
  private patterns: string[];
  private definitions: FlagDefinition[] = [];

  constructor(patterns: string[]) {
    this.patterns = patterns;
  }

  /**
   * Update glob patterns for flag file search
   */
  updatePatterns(patterns: string[]): void {
    this.patterns = patterns;
  }

  /**
   * Get all detected flag definitions
   */
  getDefinitions(): FlagDefinition[] {
    return this.definitions;
  }

  /**
   * Get all detected flags across all files
   */
  getAllFlags(): DetectedFlag[] {
    return this.definitions.flatMap((def) => def.flags);
  }

  /**
   * Toggle a boolean flag value in the source file
   */
  async toggleBooleanFlag(flag: DetectedFlag): Promise<boolean> {
    if (flag.type !== "boolean") {
      return false;
    }

    try {
      const uri = vscode.Uri.file(flag.location.filePath);
      const document = await vscode.workspace.openTextDocument(uri);
      const line = document.lineAt(flag.location.line - 1);
      const lineText = line.text;

      // Find and replace the boolean value
      const newValue = !flag.value;
      const oldValueStr = flag.value ? "true" : "false";
      const newValueStr = newValue ? "true" : "false";

      // Replace the boolean value in the line
      const newLineText = lineText.replace(
        new RegExp(`(${flag.name}\\s*:\\s*)${oldValueStr}`),
        `$1${newValueStr}`
      );

      if (newLineText === lineText) {
        // Fallback: try simpler replacement
        const simpleNewText = lineText.replace(oldValueStr, newValueStr);
        if (simpleNewText === lineText) {
          return false;
        }

        const edit = new vscode.WorkspaceEdit();
        edit.replace(uri, line.range, simpleNewText);
        await vscode.workspace.applyEdit(edit);
      } else {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(uri, line.range, newLineText);
        await vscode.workspace.applyEdit(edit);
      }

      // Save the document
      await document.save();

      return true;
    } catch (error) {
      console.error(`Error toggling flag ${flag.name}:`, error);
      return false;
    }
  }

  /**
   * Refresh flag detection by scanning workspace
   */
  async refresh(): Promise<void> {
    this.definitions = [];

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return;
    }

    // Find all matching files
    const files: vscode.Uri[] = [];
    for (const pattern of this.patterns) {
      const matches = await vscode.workspace.findFiles(
        pattern,
        "**/node_modules/**"
      );
      files.push(...matches);
    }

    // Remove duplicates
    const uniqueFiles = [...new Set(files.map((f) => f.fsPath))];

    // Parse each file
    for (const filePath of uniqueFiles) {
      try {
        const document = await vscode.workspace.openTextDocument(filePath);
        const content = document.getText();
        const parsedDefinitions = this.parseFile(filePath, content);
        this.definitions.push(...parsedDefinitions);
      } catch (error) {
        console.error(`Error parsing ${filePath}:`, error);
      }
    }
  }

  /**
   * Parse a TypeScript file for flag definitions
   */
  private parseFile(filePath: string, content: string): FlagDefinition[] {
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    const definitions: FlagDefinition[] = [];

    const visit = (node: ts.Node): void => {
      // Look for variable declarations
      if (ts.isVariableStatement(node)) {
        for (const declaration of node.declarationList.declarations) {
          const result = this.analyzeDeclaration(
            declaration,
            sourceFile,
            filePath
          );
          if (result) {
            definitions.push(result);
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    ts.forEachChild(sourceFile, visit);

    return definitions;
  }

  /**
   * Analyze a variable declaration for flag patterns
   */
  private analyzeDeclaration(
    declaration: ts.VariableDeclaration,
    sourceFile: ts.SourceFile,
    filePath: string
  ): FlagDefinition | null {
    const variableName = declaration.name.getText(sourceFile);
    const initializer = declaration.initializer;

    if (!initializer) {
      return null;
    }

    // Pattern 1: Object literal with `as const`
    if (ts.isAsExpression(initializer)) {
      const typeNode = initializer.type;
      if (
        typeNode &&
        ts.isTypeReferenceNode(typeNode) &&
        typeNode.typeName.getText(sourceFile) === "const"
      ) {
        const expression = initializer.expression;
        if (ts.isObjectLiteralExpression(expression)) {
          const flags = this.extractFlagsFromObjectLiteral(
            expression,
            sourceFile,
            filePath
          );
          if (flags.length > 0) {
            return {
              filePath,
              variableName,
              flags,
              pattern: "as-const",
            };
          }
        }
      }
    }

    // Pattern 2: defineFlags() call
    if (ts.isCallExpression(initializer)) {
      const callName = initializer.expression.getText(sourceFile);

      if (callName === "defineFlags" && initializer.arguments.length > 0) {
        const arg = initializer.arguments[0];
        if (ts.isObjectLiteralExpression(arg)) {
          const flags = this.extractFlagsFromObjectLiteral(
            arg,
            sourceFile,
            filePath
          );
          if (flags.length > 0) {
            return {
              filePath,
              variableName,
              flags,
              pattern: "defineFlags",
            };
          }
        }
      }

      // Pattern 3: createFlags() call with descriptions
      if (callName === "createFlags" && initializer.arguments.length > 0) {
        const arg = initializer.arguments[0];
        if (ts.isObjectLiteralExpression(arg)) {
          const flags = this.extractFlagsFromCreateFlags(
            arg,
            sourceFile,
            filePath
          );
          if (flags.length > 0) {
            return {
              filePath,
              variableName,
              flags,
              pattern: "createFlags",
            };
          }
        }
      }
    }

    // Pattern 4: Plain object literal (without as const)
    if (ts.isObjectLiteralExpression(initializer)) {
      const flags = this.extractFlagsFromObjectLiteral(
        initializer,
        sourceFile,
        filePath
      );
      if (flags.length > 0) {
        return {
          filePath,
          variableName,
          flags,
          pattern: "unknown",
        };
      }
    }

    return null;
  }

  /**
   * Extract flags from an object literal expression
   */
  private extractFlagsFromObjectLiteral(
    objectLiteral: ts.ObjectLiteralExpression,
    sourceFile: ts.SourceFile,
    filePath: string
  ): DetectedFlag[] {
    const flags: DetectedFlag[] = [];

    for (const property of objectLiteral.properties) {
      if (ts.isPropertyAssignment(property)) {
        const name = property.name.getText(sourceFile);
        const valueResult = this.extractValue(property.initializer, sourceFile);

        if (valueResult) {
          const { line, character } =
            sourceFile.getLineAndCharacterOfPosition(property.getStart());

          flags.push({
            name,
            value: valueResult.value,
            type: valueResult.type,
            location: {
              filePath,
              line: line + 1,
              column: character,
            },
          });
        }
      }
    }

    return flags;
  }

  /**
   * Extract flags from createFlags pattern with descriptions
   */
  private extractFlagsFromCreateFlags(
    objectLiteral: ts.ObjectLiteralExpression,
    sourceFile: ts.SourceFile,
    filePath: string
  ): DetectedFlag[] {
    const flags: DetectedFlag[] = [];

    for (const property of objectLiteral.properties) {
      if (ts.isPropertyAssignment(property)) {
        const name = property.name.getText(sourceFile);

        // Expect { value: ..., description: "..." }
        if (ts.isObjectLiteralExpression(property.initializer)) {
          let value: boolean | string | number | undefined;
          let type: "boolean" | "string" | "number" | undefined;
          let description: string | undefined;

          for (const innerProp of property.initializer.properties) {
            if (ts.isPropertyAssignment(innerProp)) {
              const propName = innerProp.name.getText(sourceFile);

              if (propName === "value") {
                const valueResult = this.extractValue(
                  innerProp.initializer,
                  sourceFile
                );
                if (valueResult) {
                  value = valueResult.value;
                  type = valueResult.type;
                }
              } else if (propName === "description") {
                if (ts.isStringLiteral(innerProp.initializer)) {
                  description = innerProp.initializer.text;
                }
              }
            }
          }

          if (value !== undefined && type !== undefined) {
            const { line, character } =
              sourceFile.getLineAndCharacterOfPosition(property.getStart());

            flags.push({
              name,
              value,
              type,
              description,
              location: {
                filePath,
                line: line + 1,
                column: character,
              },
            });
          }
        }
      }
    }

    return flags;
  }

  /**
   * Extract value and type from an expression
   */
  private extractValue(
    expression: ts.Expression,
    sourceFile: ts.SourceFile
  ): { value: boolean | string | number; type: "boolean" | "string" | "number" } | null {
    if (expression.kind === ts.SyntaxKind.TrueKeyword) {
      return { value: true, type: "boolean" };
    }

    if (expression.kind === ts.SyntaxKind.FalseKeyword) {
      return { value: false, type: "boolean" };
    }

    if (ts.isStringLiteral(expression)) {
      return { value: expression.text, type: "string" };
    }

    if (ts.isNumericLiteral(expression)) {
      return { value: parseFloat(expression.text), type: "number" };
    }

    // Handle negative numbers
    if (
      ts.isPrefixUnaryExpression(expression) &&
      expression.operator === ts.SyntaxKind.MinusToken &&
      ts.isNumericLiteral(expression.operand)
    ) {
      return {
        value: -parseFloat(expression.operand.text),
        type: "number",
      };
    }

    return null;
  }
}
