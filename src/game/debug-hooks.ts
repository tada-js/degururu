/**
 * Mount debug/testing hooks on window for automation.
 *
 * @param {{
 *   state: State;
 *   renderer: { getViewState?: () => { cameraY: number; viewHWorld: number; cameraOverrideY?: number | null } | undefined };
 *   snapshotForText: (state: State) => Record<string, unknown>;
 *   tickFixed: (ms: number) => void;
 * }} opts
 */
export function mountDebugHooks<State>(opts: {
  state: State;
  renderer: { getViewState?: () => { cameraY: number; viewHWorld: number; cameraOverrideY?: number | null } | undefined };
  snapshotForText: (state: State) => Record<string, unknown>;
  tickFixed: (ms: number) => void;
}): void {
  const { state, renderer, snapshotForText, tickFixed } = opts;

  window.render_game_to_text = () => {
    const base = snapshotForText(state);
    const v = renderer.getViewState?.();
    if (v) base.camera = { cameraY: v.cameraY, viewHWorld: v.viewHWorld, override: v.cameraOverrideY };
    return JSON.stringify(base);
  };

  window.advanceTime = async (ms) => {
    tickFixed(ms);
  };
}

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => Promise<void>;
  }
}
