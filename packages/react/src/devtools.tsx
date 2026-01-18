import { useState, useEffect } from "react";
import { useFlagState, useFeatureFlagContext } from "./context";
import type { FlagValue, FeatureFlags } from "./types";

declare const __DEV__: boolean | undefined;

type Position = "bottom-right" | "bottom-left" | "top-right" | "top-left";

interface DevToolsProps {
  position?: Position;
  defaultOpen?: boolean;
  /**
   * Keyboard shortcut to toggle the DevTools panel.
   * Set to `false` to disable the shortcut.
   * @default "mod+shift+f" (Cmd+Shift+F on Mac, Ctrl+Shift+F on Windows/Linux)
   */
  shortcut?: string | false;
}

const POSITION_STORAGE_KEY = "localflag:position";

const positionStyles: Record<string, React.CSSProperties> = {
  "bottom-right": { bottom: 12, right: 12 },
  "bottom-left": { bottom: 12, left: 12 },
  "top-right": { top: 12, right: 12 },
  "top-left": { top: 12, left: 12 },
};

const baseStyles: React.CSSProperties = {
  position: "fixed",
  zIndex: 99999,
  fontFamily:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  fontSize: 12,
  lineHeight: 1.5,
  WebkitFontSmoothing: "antialiased",
};

const panelStyles: React.CSSProperties = {
  backgroundColor: "#0a0a0a",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: 10,
  boxShadow:
    "0 0 0 1px rgba(0, 0, 0, 0.5), 0 16px 70px rgba(0, 0, 0, 0.6)",
  overflow: "hidden",
  minWidth: 260,
  maxWidth: 320,
  maxHeight: "60vh",
};

const headerStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 12px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
  cursor: "pointer",
  userSelect: "none",
};

const titleStyles: React.CSSProperties = {
  color: "rgba(255, 255, 255, 0.9)",
  fontWeight: 500,
  fontSize: 11,
  letterSpacing: "0.01em",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const tabBarStyles: React.CSSProperties = {
  display: "flex",
  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
  padding: "0 12px",
  gap: 4,
};

const tabStyles: React.CSSProperties = {
  padding: "8px 10px",
  fontSize: 11,
  fontWeight: 500,
  color: "rgba(255, 255, 255, 0.5)",
  backgroundColor: "transparent",
  border: "none",
  borderBottom: "2px solid transparent",
  cursor: "pointer",
  transition: "color 0.15s ease",
  fontFamily: "inherit",
  marginBottom: -1,
};

const tabActiveStyles: React.CSSProperties = {
  ...tabStyles,
  color: "rgba(255, 255, 255, 0.9)",
  borderBottomColor: "#fff",
};

const contentStyles: React.CSSProperties = {
  padding: 0,
  overflowY: "auto",
  maxHeight: "calc(60vh - 84px)",
};

const flagRowStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 12px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
  transition: "background-color 0.15s ease",
  gap: 12,
};

const flagRowHoverStyles: React.CSSProperties = {
  backgroundColor: "rgba(255, 255, 255, 0.03)",
};

const flagNameContainerStyles: React.CSSProperties = {
  flex: 1,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  gap: 2,
  minWidth: 0,
};

const flagNameStyles: React.CSSProperties = {
  color: "rgba(255, 255, 255, 0.7)",
  fontSize: 12,
  fontWeight: 400,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const flagDescriptionStyles: React.CSSProperties = {
  color: "rgba(255, 255, 255, 0.4)",
  fontSize: 10,
  fontWeight: 400,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const toggleStyles: React.CSSProperties = {
  position: "relative",
  width: 28,
  height: 16,
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  borderRadius: 8,
  cursor: "pointer",
  transition: "background-color 0.15s ease",
  flexShrink: 0,
  border: "none",
  padding: 0,
};

const toggleActiveStyles: React.CSSProperties = {
  ...toggleStyles,
  backgroundColor: "#fff",
};

const toggleKnobStyles: React.CSSProperties = {
  position: "absolute",
  top: 2,
  left: 2,
  width: 12,
  height: 12,
  backgroundColor: "rgba(255, 255, 255, 0.5)",
  borderRadius: "50%",
  transition: "transform 0.15s ease, background-color 0.15s ease",
};

const toggleKnobActiveStyles: React.CSSProperties = {
  ...toggleKnobStyles,
  transform: "translateX(12px)",
  backgroundColor: "#0a0a0a",
};

const inputStyles: React.CSSProperties = {
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: 5,
  color: "rgba(255, 255, 255, 0.9)",
  padding: "3px 8px",
  fontSize: 11,
  width: 72,
  outline: "none",
  transition: "border-color 0.15s ease, background-color 0.15s ease",
};

const overrideDotStyles: React.CSSProperties = {
  width: 5,
  height: 5,
  borderRadius: "50%",
  backgroundColor: "#3b82f6",
  flexShrink: 0,
};

const buttonStyles: React.CSSProperties = {
  backgroundColor: "transparent",
  border: "none",
  color: "rgba(255, 255, 255, 0.4)",
  cursor: "pointer",
  padding: 4,
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "color 0.15s ease",
};

const resetButtonStyles: React.CSSProperties = {
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: 6,
  color: "rgba(255, 255, 255, 0.6)",
  padding: "6px 10px",
  fontSize: 11,
  fontWeight: 500,
  cursor: "pointer",
  margin: "8px 12px 10px",
  width: "calc(100% - 24px)",
  transition: "background-color 0.15s ease, color 0.15s ease",
  fontFamily: "inherit",
};

const fabStyles: React.CSSProperties = {
  height: 32,
  paddingLeft: 10,
  paddingRight: 10,
  borderRadius: 8,
  backgroundColor: "#0a0a0a",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  boxShadow:
    "0 0 0 1px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.4)",
  transition: "background-color 0.15s ease, border-color 0.15s ease",
  fontFamily: "inherit",
  fontSize: 11,
  fontWeight: 500,
  color: "rgba(255, 255, 255, 0.8)",
};

const badgeStyles: React.CSSProperties = {
  backgroundColor: "#3b82f6",
  color: "#fff",
  fontSize: 9,
  fontWeight: 600,
  minWidth: 14,
  height: 14,
  padding: "0 4px",
  borderRadius: 7,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const optionsSectionStyles: React.CSSProperties = {
  padding: "12px",
};

const optionsLabelStyles: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  color: "rgba(255, 255, 255, 0.5)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 8,
  display: "block",
};

const positionGridStyles: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 6,
};

const positionButtonStyles: React.CSSProperties = {
  padding: "8px",
  fontSize: 10,
  fontWeight: 500,
  color: "rgba(255, 255, 255, 0.6)",
  backgroundColor: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: 6,
  cursor: "pointer",
  transition: "all 0.15s ease",
  fontFamily: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

const positionButtonActiveStyles: React.CSSProperties = {
  ...positionButtonStyles,
  color: "rgba(255, 255, 255, 0.9)",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  borderColor: "rgba(255, 255, 255, 0.2)",
};

function FlagIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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

function ChevronIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: direction === "up" ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.15s ease",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function PositionIcon({ position }: { position: Position }) {
  const dotPosition = {
    "top-left": { top: 2, left: 2 },
    "top-right": { top: 2, right: 2 },
    "bottom-left": { bottom: 2, left: 2 },
    "bottom-right": { bottom: 2, right: 2 },
  }[position];

  return (
    <div
      style={{
        width: 14,
        height: 14,
        border: "1px solid currentColor",
        borderRadius: 2,
        position: "relative",
        opacity: 0.7,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 4,
          height: 4,
          backgroundColor: "currentColor",
          borderRadius: 1,
          ...dotPosition,
        }}
      />
    </div>
  );
}

function FlagRow({
  name,
  value,
  defaultValue,
  description,
  onToggle,
  onChange,
}: {
  name: string;
  value: FlagValue;
  defaultValue: FlagValue;
  description?: string;
  onToggle: () => void;
  onChange: (value: FlagValue) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isOverridden = value !== defaultValue;
  const isBoolean = typeof value === "boolean";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const num = Number(newValue);
    if (!isNaN(num) && newValue !== "") {
      onChange(num);
    } else {
      onChange(newValue);
    }
  };

  return (
    <div
      style={{
        ...flagRowStyles,
        ...(isHovered ? flagRowHoverStyles : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={flagNameContainerStyles}>
        <span style={flagNameStyles}>
          {isOverridden && <span style={overrideDotStyles} />}
          {name}
        </span>
        {description && (
          <span style={flagDescriptionStyles}>{description}</span>
        )}
      </div>
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
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
            e.target.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
            e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
          }}
        />
      )}
    </div>
  );
}

function OptionsTab({
  position,
  onPositionChange,
}: {
  position: Position;
  onPositionChange: (position: Position) => void;
}) {
  const [hoveredPosition, setHoveredPosition] = useState<Position | null>(null);
  const positions: { value: Position; label: string }[] = [
    { value: "top-left", label: "Top Left" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-right", label: "Bottom Right" },
  ];

  return (
    <div style={optionsSectionStyles}>
      <span style={optionsLabelStyles}>Position</span>
      <div style={positionGridStyles}>
        {positions.map(({ value, label }) => {
          const isActive = position === value;
          const isHovered = hoveredPosition === value;
          return (
            <button
              key={value}
              style={{
                ...(isActive ? positionButtonActiveStyles : positionButtonStyles),
                ...(isHovered && !isActive
                  ? {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(255, 255, 255, 0.12)",
                    }
                  : {}),
              }}
              onClick={() => onPositionChange(value)}
              onMouseEnter={() => setHoveredPosition(value)}
              onMouseLeave={() => setHoveredPosition(null)}
              type="button"
            >
              <PositionIcon position={value} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DevToolsInner({
  position: initialPosition,
  defaultOpen,
  shortcut,
}: {
  position: Position;
  defaultOpen: boolean;
  shortcut: string | false;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<"flags" | "options">("flags");
  const [position, setPosition] = useState<Position>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(POSITION_STORAGE_KEY);
      if (stored && stored in positionStyles) {
        return stored as Position;
      }
    }
    return initialPosition;
  });
  const [fabHovered, setFabHovered] = useState(false);
  const [resetHovered, setResetHovered] = useState(false);
  const [headerHovered, setHeaderHovered] = useState(false);
  const flagState = useFlagState();
  const context = useFeatureFlagContext<FeatureFlags>();

  // Keyboard shortcut
  useEffect(() => {
    if (shortcut === false) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcut]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(POSITION_STORAGE_KEY, position);
    }
  }, [position]);

  if (!flagState) {
    return null;
  }

  const { setFlag, resetFlags } = context;
  const { flags, defaultFlags, descriptions } = flagState;
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
          style={{
            ...fabStyles,
            ...(fabHovered
              ? {
                  backgroundColor: "#141414",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                }
              : {}),
          }}
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setFabHovered(true)}
          onMouseLeave={() => setFabHovered(false)}
          type="button"
          aria-label="Open feature flags devtools"
        >
          <FlagIcon size={12} />
          <span>Flags</span>
          {overrideCount > 0 && <span style={badgeStyles}>{overrideCount}</span>}
        </button>
      </div>
    );
  }

  return (
    <div style={{ ...baseStyles, ...positionStyles[position] }}>
      <div style={panelStyles}>
        <div
          style={{
            ...headerStyles,
            ...(headerHovered
              ? { backgroundColor: "rgba(255, 255, 255, 0.02)" }
              : {}),
          }}
          onClick={() => setIsOpen(false)}
          onMouseEnter={() => setHeaderHovered(true)}
          onMouseLeave={() => setHeaderHovered(false)}
        >
          <span style={titleStyles}>
            <FlagIcon size={12} />
            Feature Flags
            {overrideCount > 0 && <span style={badgeStyles}>{overrideCount}</span>}
          </span>
          <button
            style={{
              ...buttonStyles,
              ...(headerHovered ? { color: "rgba(255, 255, 255, 0.6)" } : {}),
            }}
            type="button"
            aria-label="Close"
          >
            <ChevronIcon direction="down" />
          </button>
        </div>

        <div style={tabBarStyles}>
          <button
            style={activeTab === "flags" ? tabActiveStyles : tabStyles}
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("flags");
            }}
            type="button"
          >
            Flags
          </button>
          <button
            style={activeTab === "options" ? tabActiveStyles : tabStyles}
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("options");
            }}
            type="button"
          >
            Options
          </button>
        </div>

        {activeTab === "flags" ? (
          <>
            <div style={contentStyles}>
              {flagEntries.map(([key, value]) => (
                <FlagRow
                  key={key}
                  name={key}
                  value={value}
                  defaultValue={defaultFlags[key]}
                  description={descriptions[key]}
                  onToggle={() => handleToggle(key)}
                  onChange={(newValue) => handleChange(key, newValue)}
                />
              ))}
            </div>
            {overrideCount > 0 && (
              <button
                style={{
                  ...resetButtonStyles,
                  ...(resetHovered
                    ? {
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                        color: "rgba(255, 255, 255, 0.8)",
                      }
                    : {}),
                }}
                onClick={resetFlags}
                onMouseEnter={() => setResetHovered(true)}
                onMouseLeave={() => setResetHovered(false)}
                type="button"
              >
                Reset overrides
              </button>
            )}
          </>
        ) : (
          <OptionsTab position={position} onPositionChange={setPosition} />
        )}
      </div>
    </div>
  );
}

export function LocalFlagDevTools({
  position = "bottom-right",
  defaultOpen = false,
  shortcut = "mod+shift+f",
}: DevToolsProps) {
  const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : true;
  if (!isDev) {
    return null;
  }

  return (
    <DevToolsInner
      position={position}
      defaultOpen={defaultOpen}
      shortcut={shortcut}
    />
  );
}

/** @deprecated Use `LocalFlagDevTools` instead */
export const DevTools = LocalFlagDevTools;

export default LocalFlagDevTools;
