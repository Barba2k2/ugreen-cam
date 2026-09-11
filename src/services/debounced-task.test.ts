import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DebouncedTask } from "./debounced-task";

describe("DebouncedTask", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("runs once after a burst of schedules", () => {
    const task = new DebouncedTask(600);
    const runs: string[] = [];

    task.schedule(() => runs.push("first"));
    vi.advanceTimersByTime(300);
    task.schedule(() => runs.push("second"));
    vi.advanceTimersByTime(599);
    expect(runs).toEqual([]);

    vi.advanceTimersByTime(1);
    expect(runs).toEqual(["second"]);
  });
});
