export type BrowserEventListener = (event: Event) => void;

export interface BrowserEventTargetLike {
  addEventListener(type: string, listener: BrowserEventListener): void;
  removeEventListener(type: string, listener: BrowserEventListener): void;
}

export interface BrowserVisibilityTargetLike extends BrowserEventTargetLike {
  readonly visibilityState?: string;
}

export const getEventTime = (event: Event, now: () => number): number => {
  const timeStamp = (event as { readonly timeStamp?: unknown }).timeStamp;
  return typeof timeStamp === "number" && Number.isFinite(timeStamp) ? timeStamp : now();
};

export const getEventTarget = (event: Event): unknown =>
  (event as { readonly target?: unknown }).target;

export const shouldIgnoreEditableTarget = (
  event: Event,
  ignoreEditableTargets: boolean
): boolean => ignoreEditableTargets && isEditableTarget(getEventTarget(event));

export const isEditableTarget = (target: unknown): boolean => {
  const candidate = target as {
    readonly tagName?: unknown;
    readonly isContentEditable?: unknown;
    closest?: (selector: string) => unknown;
  } | undefined;

  if (!candidate) {
    return false;
  }

  const tagName = typeof candidate.tagName === "string"
    ? candidate.tagName.toUpperCase()
    : "";
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
    return true;
  }

  if (candidate.isContentEditable === true) {
    return true;
  }

  if (typeof candidate.closest === "function") {
    return Boolean(
      candidate.closest("input, textarea, select, [contenteditable='true'], [data-inputflow-editable='true']")
    );
  }

  return false;
};

export const hasEventTargetShape = (value: unknown): value is BrowserEventTargetLike => {
  const candidate = value as Partial<BrowserEventTargetLike> | undefined;
  return (
    typeof candidate?.addEventListener === "function" &&
    typeof candidate.removeEventListener === "function"
  );
};

export const resolveDefaultEventTarget = (): BrowserEventTargetLike | undefined =>
  hasEventTargetShape(globalThis) ? globalThis : undefined;

export const resolveDefaultVisibilityTarget = (): BrowserVisibilityTargetLike | undefined => {
  const candidate = (globalThis as { readonly document?: unknown }).document;
  return hasEventTargetShape(candidate) ? candidate : undefined;
};
