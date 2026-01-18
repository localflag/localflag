export const defaultFlags = {
  darkMode: false,
  newHeader: true,
  experimentalFeature: false,
  maxItems: 10,
  apiVersion: "v1",
} as const;

export type AppFlags = typeof defaultFlags;
