export type RequestAttemptPolicy = {
  maxFailures: number;
  minFeedbackMs: number;
};

export type RequestAttemptState = {
  failures: number;
  maxFailures: number;
  remainingFailures: number;
  isLimitReached: boolean;
};

const normalizeFailures = (failures: number): number => {
  return Number.isFinite(failures) && failures > 0 ? Math.floor(failures) : 0;
};

const normalizeMaxFailures = (maxFailures: number): number => {
  return Number.isFinite(maxFailures) && maxFailures > 0 ? Math.floor(maxFailures) : 1;
};

export const createRequestAttemptState = (
  policy: RequestAttemptPolicy,
  failures = 0,
): RequestAttemptState => {
  const normalizedFailures = normalizeFailures(failures);
  const normalizedMaxFailures = normalizeMaxFailures(policy.maxFailures);
  const remainingFailures = Math.max(normalizedMaxFailures - normalizedFailures, 0);

  return {
    failures: normalizedFailures,
    maxFailures: normalizedMaxFailures,
    remainingFailures,
    isLimitReached: remainingFailures === 0,
  };
};

export const recordRequestFailure = (
  state: RequestAttemptState,
  policy: RequestAttemptPolicy,
): RequestAttemptState => {
  return createRequestAttemptState(policy, state.failures + 1);
};

export const resetRequestAttemptState = (policy: RequestAttemptPolicy): RequestAttemptState => {
  return createRequestAttemptState(policy);
};
