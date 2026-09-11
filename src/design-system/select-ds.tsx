import type { OptionDsData } from "./option-ds-data";

interface SelectDsProps {
  options: OptionDsData<string>[];
  value: string;
  disabled: boolean;
  ariaLabel: string;
  onChange: (value: string) => void;
}

export function SelectDs({ options, value, disabled, ariaLabel, onChange }: SelectDsProps) {
  return (
    <select
      className="select-ds"
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.currentTarget.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
