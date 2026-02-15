import { Suspense } from "react";
import dynamic from "next/dynamic";

const GameClient = dynamic(() => import("../components/game-client"), { ssr: false });

export default function Page() {
  // RSC shell for SEO/streaming; the game itself is a client-only canvas app.
  return (
    <Suspense fallback={null}>
      <GameClient />
    </Suspense>
  );
}

