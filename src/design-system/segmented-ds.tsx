import type { OptionDsData } from "./option-ds-data";

interface SegmentedDsProps {
  options: OptionDsData<number>[];
  value: number;
  disabled: boolean;
  ariaLabel: string;
  onChange: (value: number) => void;
}

export function SegmentedDs({ options, value, disabled, ariaLabel, onChange }: SegmentedDsProps) {
  return (
    <fieldset className="segmented-ds" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          className="segmented-ds__option"
          type="button"
          aria-pressed={option.value === value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  );
}
