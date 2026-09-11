interface TextFieldDsProps {
  value: string;
  placeholder: string;
  ariaLabel: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function TextFieldDs({
  value,
  placeholder,
  ariaLabel,
  disabled,
  onChange,
  onSubmit,
}: TextFieldDsProps) {
  return (
    <input
      className="text-field-ds"
      type="text"
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      disabled={disabled}
      maxLength={40}
      onChange={(event) => onChange(event.currentTarget.value)}
      onKeyDown={(event) => event.key === "Enter" && onSubmit()}
    />
  );
}
