"use client";
import { Player, Quiz } from "@/components/QuestionAnswer";
import { useEffect, useState } from "react";
import supabase from "@/supabase/supabaseClient";

export default function PlayerList({
  initPlayers,
  quiz,
  playerId,
}: {
  initPlayers: Player[];
  quiz: Quiz;
  playerId?: string;
}) {
  const [players, setPlayers] = useState<Player[]>(initPlayers);

  useEffect(() => {
    setPlayers(initPlayers);
  }, [initPlayers]);

  useEffect(() => {
    if (!quiz || !playerId) return;

    //get all current players first
    const playerChannel = supabase
      .channel(`player-${playerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "player" },
        (payload) => {
          const player = payload.new as any;
          console.log("got player update:", player);
          if (player.quiz_id === quiz.id)
            setPlayers((p: any[]) => {
              const index = p.findIndex((pl) => pl.id === player.id);
              if (index === -1) return [...p, player];
              return p.map((pl) => (pl.id === player.id ? player : pl));
            });
        }
      )
      .subscribe();

    return () => {
      playerChannel.unsubscribe();
    };
  }, [quiz, playerId]);

  return (
    <div className="flex flex-col gap-4 p-4 w-full bg-white border rounded-lg">
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
