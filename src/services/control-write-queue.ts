/**
 * Serialises writes per control: while one USB write is in flight, only the
 * latest requested value is kept, so dragging a slider never floods the device.
 */
export class ControlWriteQueue {
  private readonly inFlight = new Set<string>();
  private readonly pending = new Map<string, number>();

  constructor(
    private readonly send: (controlId: string, value: number) => Promise<void>,
    private readonly onError: (error: unknown) => void,
  ) {}

  enqueue(controlId: string, value: number): void {
    if (this.inFlight.has(controlId)) {
      this.pending.set(controlId, value);
      return;
    }
    void this.flush(controlId, value);
  }

  hasPending(controlId: string): boolean {
    return this.pending.has(controlId);
  }

  private async flush(controlId: string, value: number): Promise<void> {
    this.inFlight.add(controlId);
    try {
      await this.send(controlId, value);
    } catch (error) {
      this.onError(error);
    } finally {
      this.inFlight.delete(controlId);
      const next = this.pending.get(controlId);
      if (next !== undefined) {
        this.pending.delete(controlId);
        void this.flush(controlId, next);
      }
    }
  }
}
