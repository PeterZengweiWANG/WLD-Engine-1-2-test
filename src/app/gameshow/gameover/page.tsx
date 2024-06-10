"use client";
import { Suspense, useEffect, useState } from "react";
import GameList from "../GameList";
import { Player, Quiz } from "@/components/QuestionAnswer";
import supabase from "@/supabase/supabaseClient";
import { useSearchParams } from "next/navigation";

export default function JoinGamePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="z-10 max-w-5xl w-full items-start justify-between font-mono text-sm lg:flex lg:flex-col gap-4 ">
        <Suspense fallback={<div>Loading...</div>}>
          <Leaderboard />
        </Suspense>
        <GameList />
      </div>
    </main>
  );
}

function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const searchParams = useSearchParams();
  const quizId = searchParams.get("quiz");

  useEffect(() => {
    if (!quizId) return;
    //get all other players
    const getPlayers = async () => {
      const { data, error } = await supabase
        .from("player")
        .select()
        .eq("quiz_id", quizId)
        .order("score", { ascending: false });
      if (data) setPlayers(data);
    };
    getPlayers();
  }, [quizId]);

  if (!quizId) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-4 p-4 w-full bg-white border rounded-lg">
      <h1 className="text-lg font-bold py-4">
        {`That's the end of the quiz!`} {players[0].player_name} Won!
      </h1>
      {players.map((player, i) => (
        <div key={i} className="flex items-center gap-4">
          <img
            className="max-w-16 aspect-square rounded-md"
            src={player.image}
          />
          <div className="flex flex-col">
            <p>
              {player.player_name} - {player.player_data} ({player.status})
            </p>
            <p>{player.score}pts</p>
          </div>
        </div>
      ))}
    </div>
  );
}
