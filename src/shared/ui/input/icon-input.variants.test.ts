import { describe, expect, it } from "vitest";
import { iconInputVariants } from "./icon-input.variants";

describe("iconInputVariants", () => {
  it("keeps the search input shell height consistent with or without an icon button", () => {
    expect(iconInputVariants({ variant: "default" })).toContain("min-h-16");
  });
});
