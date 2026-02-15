"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

export default function GameClient() {
  const bootedRef = useRef(false);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    // Mount the existing game runtime. This is a bridge step: Next.js shell + legacy JS core.
    // Later iterations will move this into typed React components with server actions.
    void import("../src/main.js");
  }, []);

  // Keep the DOM structure/ids so the legacy runtime can attach listeners.
  return (
    <div id="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand__title">마블 룰렛</div>
          <div className="brand__subtitle">공으로 즐기는 핀볼 사다리</div>
        </div>
        <div className="topbar__actions">
          <Button id="bgm-btn" variant="ghost" type="button" aria-pressed="false">
            BGM 끔
          </Button>
          <Button id="winner-btn" variant="ghost" type="button" disabled>
            마지막 결과
          </Button>
          <span className="topbar__divider" aria-hidden="true" />
          <Button id="settings-btn" variant="settings" type="button">
            공 설정
          </Button>
          <Button id="start-btn" variant="primary" type="button" className="topbar__start">
            시작
          </Button>
        </div>
      </header>

      <main className="stage">
        <div className="hud">
          <div className="mini">
            <div className="mini__row">
              <div className="mini__title" id="minimap-title">
                미니맵
              </div>
              <label
                className="switch"
                title="켜면 후미 공을 따라갑니다. 끄면 자유 시점으로 미니맵으로 이동합니다."
              >
                <span className="switch__label">시점 고정</span>
                <input id="view-lock" className="switch__input" type="checkbox" role="switch" disabled />
                <span className="switch__track" aria-hidden="true">
                  <span className="switch__thumb" />
                </span>
              </label>
            </div>
            <canvas id="minimap" width={260} height={190} />
            <div className="mini__hint" id="minimap-hint" />
          </div>
          <div className="balls" id="balls" />
        </div>

        <div className="board">
          <canvas id="game" width={900} height={1350} />
          <div className="board__coords">
            <div className="board__coordText" id="canvas-coord-readout">
              xFrac: -, yFrac: -
            </div>
            <Button id="canvas-coord-copy" variant="ghost" className="board__copy" type="button" disabled>
              좌표 복사
            </Button>
          </div>
        </div>
      </main>

      <dialog id="settings-dialog" className="dialog dialog--settings">
        <form method="dialog" className="twModal" id="settings-form">
          <div className="twModal__card">
            <div className="twModal__header">
              <div className="twModal__headText">
                <div className="twModal__title">공 설정</div>
                <div className="twModal__desc">공을 추가/삭제하고, 이름과 이미지를 바꿀 수 있어요.</div>
              </div>
              <button className="twModal__close" value="close" type="submit" aria-label="닫기">
                ×
              </button>
            </div>

            <div className="twModal__body">
              <div className="twList" id="settings-list" />
            </div>

          <div className="twModal__footer">
              <Button id="add-ball" variant="ghost" type="button">
                공 추가
              </Button>
              <Button id="restore-defaults" variant="ghost" type="button">
                기본값 복원
              </Button>
              <Button variant="primary" value="close" type="submit">
                닫기
              </Button>
            </div>
          </div>
        </form>
      </dialog>

      <dialog id="winner-dialog" className="dialog dialog--winner">
        <form method="dialog" className="twModal" id="winner-form">
          <div className="twModal__card">
            <div className="twModal__header">
              <div className="twModal__headText">
                <div className="twModal__title">마지막 결과</div>
                <div className="twModal__desc">마지막으로 도착한 공을 확인하세요.</div>
              </div>
              <button className="twModal__close" value="close" type="submit" aria-label="닫기">
                ×
              </button>
            </div>

            <div className="twModal__body">
              <div className="twWinner">
                <div className="twWinner__thumb">
                  <img id="winner-img" src="data:," alt="" />
                </div>
                <div className="twWinner__copy">
                  <div className="twWinner__k">마지막 도착</div>
                  <div className="twWinner__v" id="winner-name" />
                </div>
              </div>
            </div>

            <div className="twModal__footer">
              <Button variant="primary" value="close" type="submit">
                확인
              </Button>
            </div>
          </div>
        </form>
      </dialog>
    </div>
  );
}
