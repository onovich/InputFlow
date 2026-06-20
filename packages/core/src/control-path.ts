import { asControlPath, type ControlPath } from "./ids.js";

export interface ParsedControlPath {
  readonly device: string;
  readonly category: string;
  readonly control: string;
}

const controlPathPattern = /^<([A-Za-z][A-Za-z0-9]*)>\/([^/\s]+)\/(.+)$/;

export const parseControlPath = (path: string): ParsedControlPath => {
  const match = controlPathPattern.exec(path);
  if (!match) {
    throw new Error(`Invalid control path: ${path}`);
  }

  const [, device, category, control] = match;
  if (!device || !category || !control || control.includes("//")) {
    throw new Error(`Invalid control path: ${path}`);
  }

  return { device, category, control };
};

export const isControlPath = (path: string): path is ControlPath => {
  try {
    parseControlPath(path);
    return true;
  } catch {
    return false;
  }
};

export const createControlPath = (path: string): ControlPath => {
  parseControlPath(path);
  return asControlPath(path);
};
