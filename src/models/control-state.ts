export type ControlType = "range" | "toggle" | "menu";

export interface ControlState {
  id: string;
  controlType: ControlType;
  value: number;
  min: number;
  max: number;
  step: number;
  defaultValue: number | null;
  options: number[];
  writable: boolean;
  locked: boolean;
}
