/** Controls whose sliders use a logarithmic curve; ids match the Rust `ControlCatalog`. */
export class ControlScales {
  static readonly logarithmic: ReadonlySet<string> = new Set(["exposureTime"]);
}
