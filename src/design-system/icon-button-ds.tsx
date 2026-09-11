interface IconButtonDsProps {
  icon: string;
  ariaLabel: string;
  pressed?: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function IconButtonDs({ icon, ariaLabel, pressed, disabled, onClick }: IconButtonDsProps) {
  return (
    <button
      className="icon-button-ds"
      type="button"
      aria-label={ariaLabel}
      aria-pressed={pressed}
      title={ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}
