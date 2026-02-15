import test from "node:test";
import assert from "node:assert/strict";
import { makeBoard, makeGameState, startGame, setDropX, dropMarble, step } from "../src/game/engine.js";

test("drops resolve into deterministic slots (with fixed seed and dropX)", () => {
  const board = makeBoard({ slotCount: 8 });
  const ballsCatalog = [
    { id: "dog", name: "강아지", imageDataUrl: "data:image/svg+xml;utf8,<svg/>", tint: "#fff" }
  ];
  const state = makeGameState({ seed: 42, board, ballsCatalog });
  startGame(state);

  const drops = [120, 260, 450, 630, 820];
  const results = [];
  for (const x of drops) {
    setDropX(state, x);
    const m = dropMarble(state);
    assert.ok(m);
    for (let i = 0; i < 60 * 10; i++) step(state, 1 / 60);
    assert.ok(m.done, "marble should finish within 10s");
    results.push(m.result.slot);
  }

  // This is a regression snapshot. If physics changes, update intentionally.
  assert.deepEqual(results, [3, 3, 3, 7, 7]);
});
