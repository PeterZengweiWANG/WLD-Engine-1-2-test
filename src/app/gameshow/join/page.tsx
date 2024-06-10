import { Suspense } from "react";
import GameList from "../GameList";

export default function JoinGamePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="z-10 max-w-5xl w-full items-start justify-between font-mono text-sm lg:flex gap-4 ">
        <h1>Join a game</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <GameList />
        </Suspense>
      </div>
    </main>
  );
}
