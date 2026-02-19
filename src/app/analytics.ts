import { track } from "@vercel/analytics";

type AnalyticsPrimitive = string | number | boolean;
type AnalyticsPayload = Record<string, AnalyticsPrimitive>;

export const ANALYTICS_EVENTS = Object.freeze({
  gameStart: "game_start",
  resultOpen: "result_open",
  resultCopy: "result_copy",
});

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isTrackableValue(value: unknown): value is AnalyticsPrimitive {
  if (typeof value === "string") return value.length > 0;
  if (typeof value === "boolean") return true;
  if (isFiniteNumber(value)) return true;
  return false;
}

function sanitizePayload(payload: AnalyticsPayload): AnalyticsPayload {
  const nextPayload: AnalyticsPayload = {};
  for (const [key, value] of Object.entries(payload)) {
    if (!isTrackableValue(value)) continue;
    if (typeof value === "number") {
      // Keep analytics payload compact and stable.
      nextPayload[key] = Math.round(value * 1000) / 1000;
      continue;
    }
    nextPayload[key] = value;
  }
  return nextPayload;
}

export function trackAnalyticsEvent(name: AnalyticsEventName, payload: AnalyticsPayload = {}): void {
  if (typeof window === "undefined") return;
  try {
    void track(name, sanitizePayload(payload));
  } catch {
    // Ignore analytics failures so gameplay is never impacted.
  }
}
