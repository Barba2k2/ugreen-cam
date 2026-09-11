export type ControlGroupId = "image" | "color" | "exposure" | "optics";

export interface ControlGroup {
  id: ControlGroupId;
  controlIds: string[];
}
