import { DEFAULT_BALLS } from "../game/assets.js";

const KEY = "marble-roulette:balls:v1";

export function loadBallsCatalog() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_BALLS);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return structuredClone(DEFAULT_BALLS);
    const safe = [];
    for (const it of parsed) {
      if (!it || typeof it !== "object") continue;
      if (typeof it.id !== "string" || !it.id) continue;
      if (typeof it.name !== "string" || !it.name) continue;
      if (typeof it.imageDataUrl !== "string" || !it.imageDataUrl.startsWith("data:image/")) continue;
      safe.push({
        id: it.id.slice(0, 40),
        name: it.name.slice(0, 40),
        imageDataUrl: it.imageDataUrl,
        tint: typeof it.tint === "string" ? it.tint : "#ffffff"
      });
    }
    return safe.length ? safe : structuredClone(DEFAULT_BALLS);
  } catch {
    return structuredClone(DEFAULT_BALLS);
  }
}

export function saveBallsCatalog(balls) {
  localStorage.setItem(KEY, JSON.stringify(balls));
}

export function restoreDefaultBalls() {
  localStorage.removeItem(KEY);
  return structuredClone(DEFAULT_BALLS);
}

