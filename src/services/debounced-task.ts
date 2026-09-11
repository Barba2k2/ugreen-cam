/** Runs the last scheduled action once calls stop arriving for `delayMs`. */
export class DebouncedTask {
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly delayMs: number) {}

  schedule(action: () => void): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(action, this.delayMs);
  }
}
