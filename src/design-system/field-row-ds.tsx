import type { ReactNode } from "react";

interface FieldRowDsProps {
  label: string;
  valueText?: string;
  resetLabel: string;
  canReset: boolean;
  disabled: boolean;
  onReset: () => void;
  children: ReactNode;
}

/** Label, current value and a reset affordance above (or beside) one control. */
export function FieldRowDs({
  label,
  valueText,
  resetLabel,
  canReset,
  disabled,
  onReset,
  children,
}: FieldRowDsProps) {
  return (
    <div className="field-row-ds" data-disabled={disabled}>
      <div className="field-row-ds__header">
        <span className="field-row-ds__label">{label}</span>
        <span className="field-row-ds__meta">
          {canReset && !disabled && (
            <button
              className="field-row-ds__reset"
              type="button"
              aria-label={resetLabel}
              title={resetLabel}
              onClick={onReset}
            >
              ↺
            </button>
          )}
          {valueText !== undefined && <span className="field-row-ds__value">{valueText}</span>}
        </span>
      </div>
      {children}
    </div>
  );
}
