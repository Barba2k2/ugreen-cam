interface ButtonDsProps {
  label: string;
  variant: "primary" | "ghost";
  disabled?: boolean;
  onClick: () => void;
}

export function ButtonDs({ label, variant, disabled = false, onClick }: ButtonDsProps) {
  return (
    <button
      className={`button-ds button-ds--${variant}`}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
