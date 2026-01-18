import { useState } from "react";
import { useFlagState, useFeatureFlagContext } from "./context";
import type { FlagValue, FeatureFlags } from "./types";

declare const __DEV__: boolean | undefined;

interface DevToolsProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  defaultOpen?: boolean;
}

const positionStyles: Record<string, React.CSSProperties> = {
  "bottom-right": { bottom: 16, right: 16 },
  "bottom-left": { bottom: 16, left: 16 },
  "top-right": { top: 16, right: 16 },
  "top-left": { top: 16, left: 16 },
};

const baseStyles: React.CSSProperties = {
  position: "fixed",
  zIndex: 99999,
  fontFamily:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  fontSize: 13,
};

const panelStyles: React.CSSProperties = {
  backgroundColor: "#1a1a2e",
  border: "1px solid #2d2d44",
  borderRadius: 8,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  overflow: "hidden",
  minWidth: 280,
  maxWidth: 360,
  maxHeight: "70vh",
};

const headerStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 12px",
  backgroundColor: "#16162a",
  borderBottom: "1px solid #2d2d44",
  cursor: "pointer",
  userSelect: "none",
};

const titleStyles: React.CSSProperties = {
  color: "#e0e0e0",
  fontWeight: 600,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const contentStyles: React.CSSProperties = {
  padding: 0,
  overflowY: "auto",
  maxHeight: "calc(70vh - 50px)",
};

const flagRowStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 12px",
  borderBottom: "1px solid #2d2d44",
  transition: "background-color 0.15s",
};

const flagNameStyles: React.CSSProperties = {
  color: "#c0c0c0",
  fontSize: 13,
  fontWeight: 500,
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const toggleStyles: React.CSSProperties = {
  position: "relative",
  width: 40,
  height: 22,
  backgroundColor: "#3d3d5c",
  borderRadius: 11,
  cursor: "pointer",
  transition: "background-color 0.2s",
  flexShrink: 0,
  border: "none",
  padding: 0,
};

const toggleActiveStyles: React.CSSProperties = {
  ...toggleStyles,
  backgroundColor: "#4ade80",
};

const toggleKnobStyles: React.CSSProperties = {
  position: "absolute",
  top: 2,
  left: 2,
  width: 18,
  height: 18,
  backgroundColor: "#fff",
  borderRadius: "50%",
  transition: "transform 0.2s",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
};

const toggleKnobActiveStyles: React.CSSProperties = {
  ...toggleKnobStyles,
  transform: "translateX(18px)",
};

const inputStyles: React.CSSProperties = {
  backgroundColor: "#2d2d44",
  border: "1px solid #3d3d5c",
  borderRadius: 4,
  color: "#e0e0e0",
  padding: "4px 8px",
  fontSize: 12,
  width: 80,
  outline: "none",
};

const badgeStyles: React.CSSProperties = {
  backgroundColor: "#4ade80",
  color: "#1a1a2e",
  fontSize: 10,
  fontWeight: 700,
  padding: "2px 6px",
  borderRadius: 4,
  marginLeft: 6,
};

const overrideBadgeStyles: React.CSSProperties = {
  backgroundColor: "#f59e0b",
  color: "#1a1a2e",
  fontSize: 9,
  fontWeight: 600,
  padding: "1px 4px",
  borderRadius: 3,
  marginLeft: 6,
};

const buttonStyles: React.CSSProperties = {
  backgroundColor: "transparent",
  border: "none",
  color: "#888",
  cursor: "pointer",
  padding: 4,
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "color 0.15s, background-color 0.15s",
};

const resetButtonStyles: React.CSSProperties = {
  backgroundColor: "#2d2d44",
  border: "1px solid #3d3d5c",
  borderRadius: 4,
  color: "#c0c0c0",
  padding: "6px 12px",
  fontSize: 11,
  cursor: "pointer",
  margin: "8px 12px 12px",
  width: "calc(100% - 24px)",
  transition: "background-color 0.15s",
};

const fabStyles: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  backgroundColor: "#4ade80",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(74, 222, 128, 0.4)",
  transition: "transform 0.15s, box-shadow 0.15s",
};

function FlagIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function FlagRow({
  name,
  value,
  defaultValue,
  onToggle,
  onChange,
}: {
  name: string;
  value: FlagValue;
  defaultValue: FlagValue;
  onToggle: () => void;
  onChange: (value: FlagValue) => void;
}) {
  const isOverridden = value !== defaultValue;
  const isBoolean = typeof value === "boolean";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Try to parse as number
    const num = Number(newValue);
    if (!isNaN(num) && newValue !== "") {
      onChange(num);
    } else {
      onChange(newValue);
    }
  };

  return (
    <div style={flagRowStyles}>
      <span style={flagNameStyles}>
        {name}
        {isOverridden && <span style={overrideBadgeStyles}>override</span>}
      </span>
      {isBoolean ? (
        <button
          style={value ? toggleActiveStyles : toggleStyles}
          onClick={onToggle}
          type="button"
          aria-label={`Toggle ${name}`}
        >
          <span style={value ? toggleKnobActiveStyles : toggleKnobStyles} />
        </button>
      ) : (
        <input
          style={inputStyles}
          type="text"
          value={String(value)}
          onChange={handleInputChange}
        />
      )}
    </div>
  );
}

function DevToolsInner({
  position,
  defaultOpen,
}: {
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const flagState = useFlagState();
  const context = useFeatureFlagContext<FeatureFlags>();

  if (!flagState) {
    return null;
  }

  const { setFlag, resetFlags } = context;

  const { flags, defaultFlags } = flagState;
  const flagEntries = Object.entries(flags);
  const overrideCount = flagEntries.filter(
    ([key, value]) => value !== defaultFlags[key]
  ).length;

  const handleToggle = (key: string) => {
    const currentValue = flags[key];
    if (typeof currentValue === "boolean") {
      setFlag(key, !currentValue);
    }
  };

  const handleChange = (key: string, value: FlagValue) => {
    setFlag(key, value);
  };

  if (!isOpen) {
    return (
      <div style={{ ...baseStyles, ...positionStyles[position] }}>
        <button
          style={fabStyles}
          onClick={() => setIsOpen(true)}
          type="button"
          aria-label="Open feature flags devtools"
        >
          <span style={{ color: "#1a1a2e" }}>
            <FlagIcon />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ ...baseStyles, ...positionStyles[position] }}>
      <div style={panelStyles}>
        <div style={headerStyles} onClick={() => setIsOpen(false)}>
          <span style={titleStyles}>
            <FlagIcon />
            Feature Flags
            {overrideCount > 0 && (
              <span style={badgeStyles}>{overrideCount}</span>
            )}
          </span>
          <button style={buttonStyles} type="button" aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div style={contentStyles}>
          {flagEntries.map(([key, value]) => (
            <FlagRow
              key={key}
              name={key}
              value={value}
              defaultValue={defaultFlags[key]}
              onToggle={() => handleToggle(key)}
              onChange={(newValue) => handleChange(key, newValue)}
            />
          ))}
        </div>
        {overrideCount > 0 && (
          <button style={resetButtonStyles} onClick={resetFlags} type="button">
            Reset all overrides
          </button>
        )}
      </div>
    </div>
  );
}

export function DevTools({
  position = "bottom-right",
  defaultOpen = false,
}: DevToolsProps) {
  // Don't render in production - check via global __DEV__ or fallback to always showing
  const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : true;
  if (!isDev) {
    return null;
  }

  return <DevToolsInner position={position} defaultOpen={defaultOpen} />;
}

export default DevTools;
