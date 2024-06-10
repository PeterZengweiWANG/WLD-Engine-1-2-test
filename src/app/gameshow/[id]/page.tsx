"use client";
import { useEffect, useState } from "react";
import supabase from "@/supabase/supabaseClient";
import { Player, Question, Quiz, QuizUI } from "@/components/QuestionAnswer";
import PlayerList from "../PlayerList";
import { questionTime } from "../GameList";
import { useRouter, useSearchParams } from "next/navigation";

export default function GameshowPage({ params }: { params: { id: string } }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [question, setQuestion] = useState<Question>();
  const [answer, setAnswer] = useState<string>("");
  const [timer, setTimer] = useState<number>(questionTime);
  const [players, setPlayers] = useState<Player[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    if (timer == 0) {
      //remove interval
      if (quiz?.status === "playing" && !answer) handleNoAnswer();
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    //Get the quiz
    const initializeQuiz = async (id: string) => {
      const { data, error } = await supabase
        .from("quiz")
        .select()
        .eq("id", id)
        .single();
      if (data) setQuiz(data);

      //get the player from search params
      const playerId = searchParams.get("player");
      if (playerId) {
        const { data, error } = await supabase
          .from("player")
          .select()
          .eq("id", playerId)
          .single();
        if (data) setPlayer(data);
      }
    };

    initializeQuiz(params.id);
  }, []);

  useEffect(() => {
    if (!quiz) return;

    //get all other players
    const getPlayers = async () => {
      const { data, error } = await supabase
        .from("player")
        .select()
        .eq("quiz_id", quiz.id);
      if (data) setPlayers(data);
    };
    getPlayers();

    const questionChannel = supabase
      .channel("players" + player?.id)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "question" },
        (payload) => {
          const newQuestion = payload.new;
          if (newQuestion.quiz_id === quiz.id) {
            if (quiz.status === "playing" && question && answer == "") {
              //player didn't answer, they need to lose
              handleNoAnswer();
            } else {
              setAnswer("");
              setQuestion(newQuestion as Question);
              setTimer(questionTime);
            }
          }
        }
      )
      .subscribe();

    //supscribe to quiz status changes
    const quizChannel = supabase
      .channel("quiz" + player?.id)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "quiz" },
        (payload) => {
          const quizUpdate = payload.new;
          if (quizUpdate.id === quiz.id) {
            if (quizUpdate.status === "ended") {
              //game over
              router.push("/gameshow/gameover?quiz=" + quiz.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      questionChannel.unsubscribe();
    };
  }, [quiz]);

  const handleNoAnswer = async () => {
    /*
    if (!player) return;
    const { data, error } = await supabase
      .from("player")
      .update({
        status: "lost",
      })
      .eq("id", player.id)
      .select()
      .single();
    console.log("no answer", data, error);
    if (data) setPlayer(data);
    */
  };

  const handleAnswer = async (i: number) => {
    //send the answer to supabase
    if (!question || !player || !quiz) return;

    const answer = {
      player_answer: question.answers[i],
      quiz_id: quiz.id,
      question_id: question.id,
      player_id: player.id,
    };

    //update our answer state
    setAnswer(question.answers[i]);

    const { data, error } = await supabase
      .from("answer")
      .insert(answer)
      .select()
      .single();

    console.log("player answer saved to database", data, error);
    //update the player
    const correct = question.answers[i] === question.correct_answer;

    console.log(
      "correct?",
      correct,
      Math.floor(question.points * (timer / 15))
    );

    const { data: playerUpdate, error: playerError } = await supabase
      .from("player")
      .update({
        score:
          player.score +
          (correct ? Math.floor(question.points * (timer / 15)) : 0),
        // status: correct ? "playing" : "lost",
      })
      .eq("id", player.id)
      .select()
      .single();
    console.log("player updated in database", playerUpdate, playerError);
    if (playerUpdate) setPlayer(playerUpdate);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="z-10 max-w-2xl w-full items-start justify-between font-mono text-sm lg:flex lg: flex-col gap-4 ">
        <div className="flex flex-col gap-4 w-full">
          {question ? (
            <>
              <p>
                Time: {timer}s{" "}
                {timer == 0 && "(Waiting for host to create a new question...)"}
              </p>
              {question.image && (
                <img src={question.image} className="w-full" />
              )}
              <QuizUI
                question={question}
                handleSelect={handleAnswer}
                disabled={timer == 0 || player?.status === "lost"}
              />
            </>
          ) : (
            <p>Waiting for host to start game...</p>
          )}
        </div>

        {players && quiz && (
          <PlayerList initPlayers={players} quiz={quiz} playerId={player?.id} />
        )}
      </div>
    </main>
  );
}
