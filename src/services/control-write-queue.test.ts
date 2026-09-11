import { describe, expect, it } from "vitest";
import { ControlWriteQueue } from "./control-write-queue";

class ManualSender {
  readonly sent: Array<[string, number]> = [];
  private releases: Array<() => void> = [];

  readonly send = (controlId: string, value: number): Promise<void> => {
    this.sent.push([controlId, value]);
    return new Promise((resolve) => this.releases.push(resolve));
  };

  async releaseNext(): Promise<void> {
    this.releases.shift()?.();
    await Promise.resolve();
    await Promise.resolve();
  }
}

describe("ControlWriteQueue", () => {
  it("keeps only the latest value while a write is in flight", async () => {
    const sender = new ManualSender();
    const queue = new ControlWriteQueue(sender.send, () => {});

    queue.enqueue("brightness", 10);
    queue.enqueue("brightness", 20);
    queue.enqueue("brightness", 30);
    expect(queue.hasPending("brightness")).toBe(true);

    await sender.releaseNext();
    await sender.releaseNext();

    expect(sender.sent).toEqual([
      ["brightness", 10],
      ["brightness", 30],
    ]);
    expect(queue.hasPending("brightness")).toBe(false);
  });

  it("writes different controls independently", () => {
    const sender = new ManualSender();
    const queue = new ControlWriteQueue(sender.send, () => {});

    queue.enqueue("brightness", 10);
    queue.enqueue("contrast", 5);

    expect(sender.sent).toEqual([
      ["brightness", 10],
      ["contrast", 5],
    ]);
  });

  it("reports a failed write and keeps draining", async () => {
    const sent: number[] = [];
    const errors: unknown[] = [];
    const queue = new ControlWriteQueue(
      async (_, value) => {
        sent.push(value);
        if (value === 1) {
          throw new Error("stall");
        }
      },
      (error) => errors.push(error),
    );

    queue.enqueue("gain", 1);
    queue.enqueue("gain", 2);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(sent).toEqual([1, 2]);
    expect(errors).toEqual([new Error("stall")]);
  });
});
