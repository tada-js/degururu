/**
 * Create a frame/update loop controller.
 *
 * Keeps fixed-step simulation, resize scheduling, and requestAnimationFrame loop
 * in one place so the app entry can focus on composition.
 *
 * @param {{
 *   state: State;
 *   stepFn: (state: State, dt: number) => void;
 *   renderer: { draw: (state: State, balls: Ball[], imagesById: Map<string, HTMLImageElement>) => void; resizeToFit?: () => void };
 *   getBallsCatalog: () => Ball[];
 *   getImagesById: () => Map<string, HTMLImageElement>;
 *   onAfterFrame?: () => void;
 *   syncViewportHeight?: () => void;
 *   initialSpeedMultiplier?: number;
 * }} opts
 */
export function createLoopController<State extends { mode?: string; paused?: boolean }, Ball>(opts: {
  state: State;
  stepFn: (state: State, dt: number) => void;
  renderer: {
    draw: (state: State, balls: Ball[], imagesById: Map<string, HTMLImageElement>) => void;
    resizeToFit?: () => void;
  };
  getBallsCatalog: () => Ball[];
  getImagesById: () => Map<string, HTMLImageElement>;
  onAfterFrame?: () => void;
  syncViewportHeight?: () => void;
  initialSpeedMultiplier?: number;
}) {
  const {
    state,
    stepFn,
    renderer,
    getBallsCatalog,
    getImagesById,
    onAfterFrame = () => {},
    syncViewportHeight = () => {},
    initialSpeedMultiplier = 1,
  } = opts;

  let resizeRaf = 0;
  let last = performance.now();
  let speedMultiplier = Number.isFinite(initialSpeedMultiplier)
    ? Math.max(0.5, Math.min(3, initialSpeedMultiplier))
    : 1;

  function draw(): void {
    renderer.draw(state, getBallsCatalog(), getImagesById());
  }

  /**
   * Advance simulation using a fixed 60hz step for stable behavior.
   *
   * @param {number} ms
   */
  function tickFixed(ms: number): void {
    const dt = 1 / 60;
    const steps = Math.max(1, Math.round((ms / 1000) / dt));
    for (let i = 0; i < steps; i++) stepFn(state, dt);
    draw();
    onAfterFrame();
  }

  function scheduleResize(): void {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      syncViewportHeight();
      renderer.resizeToFit?.();
      draw();
    });
  }

  function mountResizeListeners(): void {
    window.addEventListener("resize", scheduleResize);
    window.visualViewport?.addEventListener("resize", scheduleResize);
    window.visualViewport?.addEventListener("scroll", scheduleResize);
  }

  function startAnimationLoop(): void {
    function raf(now: number): void {
      const dtMs = Math.min(40, now - last);
      last = now;
      if (state.mode === "playing" && !state.paused) tickFixed(dtMs * speedMultiplier);
      else draw();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  function setSpeedMultiplier(next: number): number {
    const parsed = Number(next);
    const clamped = Number.isFinite(parsed) ? Math.max(0.5, Math.min(3, parsed)) : 1;
    speedMultiplier = clamped;
    return speedMultiplier;
  }

  return {
    tickFixed,
    scheduleResize,
    mountResizeListeners,
    startAnimationLoop,
    setSpeedMultiplier,
  };
}
