/**
 * Represents a single detected feature flag
 */
export interface DetectedFlag {
  /** Flag name/key */
  name: string;
  /** Default value of the flag */
  value: boolean | string | number;
  /** Inferred type of the flag value */
  type: "boolean" | "string" | "number";
  /** Optional description if using createFlags pattern */
  description?: string;
  /** Source location of the flag definition */
  location: FlagLocation;
}

/**
 * Source location information for a flag
 */
export interface FlagLocation {
  /** Absolute file path */
  filePath: string;
  /** Line number (1-indexed) */
  line: number;
  /** Column number (0-indexed) */
  column: number;
}

/**
 * Represents a flag definition file with its detected flags
 */
export interface FlagDefinition {
  /** Absolute file path */
  filePath: string;
  /** Name of the exported variable containing flags */
  variableName: string;
  /** All detected flags in this file */
  flags: DetectedFlag[];
  /** Pattern used to define flags */
  pattern: FlagPattern;
}

/**
 * The pattern used to define flags
 */
export type FlagPattern = "as-const" | "defineFlags" | "createFlags" | "unknown";

/**
 * Configuration for the extension
 */
export interface LocalFlagConfig {
  /** Glob patterns to search for flag files */
  flagFilePatterns: string[];
}
