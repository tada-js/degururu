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
}) {
  const {
    state,
    stepFn,
    renderer,
    getBallsCatalog,
    getImagesById,
    onAfterFrame = () => {},
    syncViewportHeight = () => {},
  } = opts;

  let resizeRaf = 0;
  let last = performance.now();

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
      if (state.mode === "playing" && !state.paused) tickFixed(dtMs);
      else draw();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  return {
    tickFixed,
    scheduleResize,
    mountResizeListeners,
    startAnimationLoop,
  };
}
