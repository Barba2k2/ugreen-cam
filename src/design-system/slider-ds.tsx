import type { CSSProperties } from "react";

interface SliderDsProps {
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  ariaLabel: string;
  onChange: (value: number) => void;
}

export function SliderDs({ value, min, max, step, disabled, ariaLabel, onChange }: SliderDsProps) {
  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <input
      className="slider-ds"
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{ "--progress": `${progress}%` } as CSSProperties}
      onChange={(event) => onChange(Number(event.currentTarget.value))}
    />
  );
}
