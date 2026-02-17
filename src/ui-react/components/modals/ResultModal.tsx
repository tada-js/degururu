import { useEffect, useMemo, useRef } from "react";
import type { ResultUiState } from "../../../app/ui-store";
import { Button } from "../Button";
import { ModalCard } from "../Modal";

type RollCandidate = {
  ballId: string;
  name: string;
  img: string;
};

type ResultModalProps = {
  state: ResultUiState;
  rollCandidates: RollCandidate[];
  onClose: () => void;
  onSkip: () => void;
  onSpinDone: () => void;
  onCopy: () => void;
  onRestart: () => void;
};

const SPIN_DURATION_MS = 2200;
const SPIN_SETTLE_MS = 130;
const REEL_ITEM_HEIGHT = 68;
const REEL_CENTER_Y = REEL_ITEM_HEIGHT;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeOutQuad(t: number) {
  return 1 - (1 - t) ** 2;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function ResultModal({
  state,
  rollCandidates,
  onClose,
  onSkip,
  onSpinDone,
  onCopy,
  onRestart,
}: ResultModalProps) {
  const reelViewportRef = useRef<HTMLDivElement | null>(null);
  const reelTrackRef = useRef<HTMLDivElement | null>(null);
  const skipButtonRef = useRef<HTMLButtonElement | null>(null);
  const restartButtonRef = useRef<HTMLButtonElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const onSpinDoneRef = useRef(onSpinDone);

  const finalWinner = state.items[0] || null;
  const isSpinning = state.phase === "spinning";
  const isSingle = state.phase === "single" && state.items.length === 1;
  const isSummary = state.phase === "summary" && state.items.length >= 2;

  useEffect(() => {
    onSpinDoneRef.current = onSpinDone;
  }, [onSpinDone]);

  const spinPlan = useMemo(() => {
    if (!finalWinner) return null;

    const target: RollCandidate = {
      ballId: finalWinner.ballId,
      name: finalWinner.name,
      img: finalWinner.img,
    };
    const source =
      rollCandidates.length > 0
        ? rollCandidates
        : state.items.map((item) => ({
            ballId: item.ballId,
            name: item.name,
            img: item.img,
          }));

    const base = source.slice(0, 72);
    if (!base.some((entry) => entry.ballId === target.ballId)) {
      base.unshift(target);
    }
    if (!base.length) {
      base.push(target);
    }
    while (base.length < 6) {
      base.push(base[base.length % Math.max(1, source.length)] || target);
    }

    const targetIndex = Math.max(
      0,
      base.findIndex((entry) => entry.ballId === target.ballId)
    );
    const loops = Math.max(8, Math.ceil(30 / base.length));
    const stopIndex = loops * base.length + targetIndex;
    const totalItems = stopIndex + base.length * 2 + 5;
    const items = Array.from({ length: totalItems }, (_, index) => {
      const entry = base[index % base.length];
      return {
        key: `${index}-${entry.ballId}-${entry.name}`,
        ...entry,
      };
    });

    const startIndex = 1;
    const startY = REEL_CENTER_Y - startIndex * REEL_ITEM_HEIGHT;
    const stopY = REEL_CENTER_Y - stopIndex * REEL_ITEM_HEIGHT;
    const overshootY = stopY - 10;

    return {
      items,
      startY,
      stopY,
      overshootY,
    };
  }, [finalWinner, rollCandidates, state.items]);

  useEffect(() => {
    const trackEl = reelTrackRef.current;
    const viewportEl = reelViewportRef.current;
    if (frameRef.current != null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (!isSpinning || !spinPlan || !trackEl) return;

    doneRef.current = false;
    trackEl.style.transform = `translate3d(0, ${spinPlan.startY}px, 0)`;
    viewportEl?.classList.add("is-fast");

    let startedAt = 0;
    const tick = (now: number) => {
      if (!startedAt) startedAt = now;
      const elapsed = now - startedAt;

      if (elapsed <= SPIN_DURATION_MS) {
        const t = Math.min(1, elapsed / SPIN_DURATION_MS);
        const y = lerp(spinPlan.startY, spinPlan.overshootY, easeOutCubic(t));
        trackEl.style.transform = `translate3d(0, ${y.toFixed(3)}px, 0)`;
        if (t >= 0.48) viewportEl?.classList.remove("is-fast");
        else viewportEl?.classList.add("is-fast");
        frameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      const settleElapsed = elapsed - SPIN_DURATION_MS;
      if (settleElapsed <= SPIN_SETTLE_MS) {
        const t = Math.min(1, settleElapsed / SPIN_SETTLE_MS);
        const y = lerp(spinPlan.overshootY, spinPlan.stopY, easeOutQuad(t));
        trackEl.style.transform = `translate3d(0, ${y.toFixed(3)}px, 0)`;
        viewportEl?.classList.remove("is-fast");
        frameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      trackEl.style.transform = `translate3d(0, ${spinPlan.stopY}px, 0)`;
      viewportEl?.classList.remove("is-fast");
      frameRef.current = null;
      if (!doneRef.current) {
        doneRef.current = true;
        onSpinDoneRef.current();
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      viewportEl?.classList.remove("is-fast");
    };
  }, [isSpinning, spinPlan]);

  useEffect(() => {
    if (!state.open) return;
    const target = isSpinning ? skipButtonRef.current : restartButtonRef.current;
    if (!target) return;
    const timer = window.setTimeout(() => {
      try {
        target.focus({ preventScroll: true });
      } catch {
        target.focus();
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [state.open, isSpinning, isSingle, isSummary]);

  const resultCountTitle = `당첨자 목록(${state.items.length})`;
  const title = isSpinning ? "결과 선택 중…" : resultCountTitle;

  return (
    <ModalCard
      size="md"
      title={title}
      onClose={onClose}
      footer={
        <div className="resultModal__actions">
          {isSpinning ? (
            <Button variant="ghost" type="button" buttonRef={skipButtonRef} onClick={onSkip}>
              모두 보기
            </Button>
          ) : (
            <>
              <Button variant="ghost" className="resultModal__copy" type="button" onClick={onCopy}>
                결과 복사
              </Button>
              <Button variant="accent" type="button" buttonRef={restartButtonRef} onClick={onRestart}>
                다시 시작
              </Button>
              <Button variant="ghost" type="button" onClick={onClose}>
                닫기
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="resultModal__body">
        {isSpinning && spinPlan ? (
          <div className="resultSpinView">
            <div className="resultSpinView__status">결과 선택 중…</div>
            <div className="resultSpinView__viewport" ref={reelViewportRef} aria-live="polite">
              <div className="resultSpinView__track" ref={reelTrackRef}>
                {spinPlan.items.map((item) => (
                  <div className="resultSpinView__item" key={item.key}>
                    <div className="resultSpinView__thumb">
                      <img src={item.img || "data:,"} alt={item.name} />
                    </div>
                    <div className="resultSpinView__name">{item.name}</div>
                  </div>
                ))}
              </div>
              <div className="resultSpinView__center" aria-hidden="true"></div>
              <div className="resultSpinView__fade resultSpinView__fade--top" aria-hidden="true"></div>
              <div className="resultSpinView__fade resultSpinView__fade--bottom" aria-hidden="true"></div>
            </div>
          </div>
        ) : isSingle && finalWinner ? (
          <div className="resultSingleCard">
            <div className="resultSingleCard__thumb">
              <img src={finalWinner.img || "data:,"} alt={finalWinner.name} />
            </div>
            <div className="resultSingleCard__name">{finalWinner.name}</div>
          </div>
        ) : isSummary ? (
          <ol className="resultSummaryList">
            {state.items.map((item) => (
              <li
                key={`${item.rank}-${item.ballId}-${item.finishedAt}`}
                className={`resultSummaryList__item ${item.rank === 1 ? "is-top" : ""}`}
              >
                <span className="resultSummaryList__rank">#{item.rank}</span>
                <span className="resultSummaryList__name">{item.name}</span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="resultRevealWaiting">결과를 준비하고 있어요.</div>
        )}
      </div>
    </ModalCard>
  );
}
