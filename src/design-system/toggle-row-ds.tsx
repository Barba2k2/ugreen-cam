import type { ReactNode } from "react";

interface ToggleRowDsProps {
  label: string;
  disabled: boolean;
  children: ReactNode;
}

/** Single-line row: label on the left, compact control (switch) on the right. */
export function ToggleRowDs({ label, disabled, children }: ToggleRowDsProps) {
  return (
    <div className="toggle-row-ds" data-disabled={disabled}>
      <span className="field-row-ds__label">{label}</span>
      {children}
    </div>
  );
}
