import { describe, expect, it } from "vitest";
import { APP_ERROR, APP_ERROR_CODE, appErrorMetaMap } from "./app-errors";

const SAFE_ERROR_CODE_PATTERN = /^MWB-[A-Z]+-\d{3}$/;
const SENSITIVE_ERROR_CODE_PARTS = ["KEY", "TOKEN", "SECRET", "URL", "BASE", "PATH", "ENV"];

describe("app error code definitions", () => {
  it("defines a unique safe code for every app error", () => {
    const appErrorTypes = Object.values(APP_ERROR);
    const codes = appErrorTypes.map((type) => APP_ERROR_CODE[type]);

    expect(new Set(codes).size).toBe(appErrorTypes.length);

    for (const code of codes) {
      expect(code).toMatch(SAFE_ERROR_CODE_PATTERN);
      for (const sensitivePart of SENSITIVE_ERROR_CODE_PARTS) {
        expect(code).not.toContain(sensitivePart);
      }
    }
  });

  it("attaches the same code to the user-facing error metadata", () => {
    for (const type of Object.values(APP_ERROR)) {
      expect(appErrorMetaMap[type].code).toBe(APP_ERROR_CODE[type]);
    }
  });
});
