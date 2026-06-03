import { describe, expect, it } from "vitest";
import {
  createRequestAttemptState,
  recordRequestFailure,
  resetRequestAttemptState,
} from "./requestAttemptPolicy";

const policy = {
  maxFailures: 3,
  minFeedbackMs: 700,
};

describe("requestAttemptPolicy", () => {
  it("tracks remaining failures before the limit", () => {
    const state = createRequestAttemptState(policy, 1);

    expect(state.failures).toBe(1);
    expect(state.remainingFailures).toBe(2);
    expect(state.isLimitReached).toBe(false);
  });

  it("marks the limit as reached at max failures", () => {
    const first = createRequestAttemptState(policy, 2);
    const next = recordRequestFailure(first, policy);

    expect(next.failures).toBe(3);
    expect(next.remainingFailures).toBe(0);
    expect(next.isLimitReached).toBe(true);
  });

  it("resets failures for successful requests", () => {
    const reset = resetRequestAttemptState(policy);

    expect(reset.failures).toBe(0);
    expect(reset.remainingFailures).toBe(3);
    expect(reset.isLimitReached).toBe(false);
  });
});
