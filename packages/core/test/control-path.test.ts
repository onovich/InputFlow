import { describe, expect, it } from "vitest";
import { createControlPath, isControlPath, parseControlPath } from "../src/index.js";

describe("control paths", () => {
  it("parses stable device category and control segments", () => {
    expect(parseControlPath("<Keyboard>/code/KeyE")).toEqual({
      device: "Keyboard",
      category: "code",
      control: "KeyE"
    });
  });

  it("brands valid paths without changing their string value", () => {
    const path = createControlPath("<Pointer>/button/primary");

    expect(path).toBe("<Pointer>/button/primary");
    expect(isControlPath(path)).toBe(true);
  });

  it("rejects malformed paths", () => {
    expect(isControlPath("Keyboard/code/KeyE")).toBe(false);
    expect(() => parseControlPath("<Keyboard>/code")).toThrow("Invalid control path");
  });
});
