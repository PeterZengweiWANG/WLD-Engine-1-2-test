"use client";
import { useEffect, useState } from "react";
import supabase from "@/supabase/supabaseClient";
import { Quiz } from "@/components/QuestionAnswer";
import { useRouter, useSearchParams } from "next/navigation";

export const questionTime = 15;

export default function GameList() {
  const [availableGames, setAvailableGames] = useState<Quiz[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const getGames = async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("quiz")
      .select()
      .eq("status", "lobby")
      .gte("created_at", fiveMinutesAgo);
    if (data) setAvailableGames(data);
  };

  useEffect(() => {
    //Get all games in lobby status that were created in the last 5 mins
    getGames();
  }, []);

  const joinGame = async (i: number) => {
    //get player from search params
    const playerId = searchParams.get("player");
    if (!playerId) return router.push("/gameshow");
    const quizId = availableGames[i].id;
    const { error } = await supabase
      .from("player")
      .update({ quiz_id: quizId })
      .eq("id", playerId);
    router.push(`/gameshow/${quizId}?player=${playerId}`);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2">
        <button
          onClick={getGames}
          className="p-2 border rounded-lg bg-white mb-2 w-full hover:shadow"
        >
          Refresh
        </button>
        <div className="text-xs font-semibold">Available Games</div>
        {availableGames.map((game, i) => (
          <button
            className="hover:shadow bg-white p-2 rounded-lg"
            key={i}
            onClick={() => joinGame(i)}
          >
            {game.host_player_name}s Game
          </button>
        ))}
      </div>
    </div>
  );
}
