type SessionWinner = {
  t: number;
};

type SessionState = {
  mode?: string;
  paused?: boolean;
  winner?: SessionWinner | null;
  seed?: number;
  rng?: unknown;
  _shownResultId?: unknown;
  _shownWinnerT?: number | null;
};

type SessionViewState = {
  tailFocusOn: boolean;
};

type SessionControllerOpts<State extends SessionState, WinnerPayload> = {
  state: State;
  renderer: { clearCameraOverride?: () => void };
  viewState: SessionViewState;
  getTotalSelectedCount: (state: State) => number;
  makeRng: (seed: number) => unknown;
  startGame: (state: State) => void;
  dropAll: (state: State) => number | null;
  resetGame: (state: State) => void;
  onPreStart?: () => void;
  onReset?: () => void;
  onUpdateControls?: () => void;
  getWinnerPayload?: () => WinnerPayload | null;
  onWinnerPayload?: (payload: WinnerPayload) => void;
  onShowWinner?: () => void;
};

/**
 * Create game session controller.
 *
 * Handles:
 * - run start/restart flow
 * - winner detection per frame
 * - camera focus reset and control updates around transitions
 *
 * @param {SessionControllerOpts<State, WinnerPayload>} opts
 */
export function createSessionController<State extends SessionState, WinnerPayload>(
  opts: SessionControllerOpts<State, WinnerPayload>
) {
  const {
    state,
    renderer,
    viewState,
    getTotalSelectedCount,
    makeRng,
    startGame,
    dropAll,
    resetGame,
    onPreStart = () => {},
    onReset = () => {},
    onUpdateControls = () => {},
    getWinnerPayload = () => null,
    onWinnerPayload = () => {},
    onShowWinner = () => {},
  } = opts;

  function clearRunCaches(): void {
    state._shownResultId = null;
    state._shownWinnerT = null;
  }

  function applyDefaultRunView(): void {
    state.paused = false;
    viewState.tailFocusOn = true;
    renderer.clearCameraOverride?.();
  }

  function tryStart(): boolean {
    if (getTotalSelectedCount(state) <= 0) return false;
    state.seed = ((Date.now() & 0xffffffff) ^ (Math.random() * 0xffffffff)) >>> 0;
    state.rng = makeRng(state.seed);
    startGame(state);
    clearRunCaches();
    onPreStart();
    onUpdateControls();
    applyDefaultRunView();
    onReset();
    dropAll(state);
    return true;
  }

  function restartIfPlaying(): void {
    if (state.mode !== "playing") return;
    resetGame(state);
    clearRunCaches();
    applyDefaultRunView();
    onReset();
  }

  function togglePause(): boolean {
    if (state.mode !== "playing" || state.winner) return false;
    state.paused = !state.paused;
    onUpdateControls();
    return true;
  }

  function onAfterFrame(): void {
    if (state.winner && state._shownWinnerT !== state.winner.t) {
      state._shownWinnerT = state.winner.t;
      const payload = getWinnerPayload();
      if (payload) onWinnerPayload(payload);
      onShowWinner();
    }
    onUpdateControls();
  }

  function handleStartClick(): void {
    restartIfPlaying();
    tryStart();
  }

  function prepareRestartForCountdown(): void {
    restartIfPlaying();
  }

  return {
    tryStart,
    handleStartClick,
    prepareRestartForCountdown,
    togglePause,
    onAfterFrame,
  };
}
