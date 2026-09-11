interface SwitchDsProps {
  checked: boolean;
  disabled: boolean;
  ariaLabel: string;
  onChange: (checked: boolean) => void;
}

export function SwitchDs({ checked, disabled, ariaLabel, onChange }: SwitchDsProps) {
  return (
    <button
      className="switch-ds"
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="switch-ds__thumb" />
    </button>
  );
}
