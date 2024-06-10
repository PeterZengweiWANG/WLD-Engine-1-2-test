"use client";
import { useEffect, useState } from "react";
import supabase from "@/supabase/supabaseClient";
import QuestionAnswer, {
  Player,
  Question,
  Quiz,
} from "@/components/QuestionAnswer";
import { useRouter, useSearchParams } from "next/navigation";
import PlayerList from "../PlayerList";
import { questionTime } from "../GameList";
import { generateImageFal } from "@/ai/fal";
import { getGroqCompletion } from "@/ai/groq";
import { uploadImageToSupabase } from "../CreatePlayer";

export const dynamic = "force-dynamic";

export default function GameshowPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [img, setImg] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);

  const router = useRouter();
  const searchparams = useSearchParams();

  useEffect(() => {
    //create the quiz
    const createGame = async () => {
      //get the player from search params
      const playerId = searchparams.get("player");
      if (!playerId) return router.push("/gameshow");
      //get the player from local storage
      const { data, error } = await supabase
        .from("player")
        .select()
        .eq("id", playerId)
        .select()
        .single();

      //Create new quiz in supabase
      const { data: quiz, error: quizError } = await supabase
        .from("quiz")
        .insert({ host_player_name: data.player_name, status: "lobby" })
        .select()
        .single();
      if (quiz) setQuiz(quiz);

      //assign the quiz to the player
      const { data: playerData, error: playerError } = await supabase
        .from("player")
        .update({ quiz_id: quiz.id })
        .eq("id", playerId)
        .select()
        .single();
      if (playerData) setPlayer(data);
    };
    createGame();
  }, []);

  const startGame = async () => {
    //Set quiz to active and update our state
    if (!quiz) return;
    const { data, error } = await supabase
      .from("quiz")
      .update({ status: "playing" })
      .eq("id", quiz.id)
      .select()
      .single();
    if (data) setQuiz(data);
    //get all of the players expertise so we can pass this to our question answer component
    const { data: pd, error: pdError } = await supabase
      .from("player")
      .select()
      .eq("quiz_id", quiz.id);
    if (pd) {
      console.log("Starting game with players: ", pd);
      setPlayers(pd);
    }
  };

  const stopGame = async () => {
    //Set quiz to active and update our state
    if (!quiz) return;
    const { data, error } = await supabase
      .from("quiz")
      .update({ status: "ended" })
      .eq("id", quiz.id)
      .select()
      .single();
    router.push("/gameshow/gameover?quiz=" + quiz.id);
  };

  const handleAnswer = async (question: Question, answer: string) => {
    //update the player
    if (!player) return;
    const correct = question.correct_answer === answer;
    const { data, error } = await supabase
      .from("player")
      .update({
        score: player.score + (correct ? question.points : 0),
        status: correct ? "playing" : "lost",
      })
      .eq("id", player.id)
      .select()
      .single();
    setPlayer(data);
  };

  const handleQuestion = async (question: Question) => {
    //save the question to supabase so other players can answer it
    if (!quiz) return;

    //if we have generated 10 questions then stop the game
    if (questions.length >= 10) {
      stopGame();
      return;
    }
    //generate an image
    let imageUrl = "";
    try {
      const imageDesc = await getGroqCompletion(
        `Question: ${question.question} Type: ${
          question.type
        } Answers: ${question.answers.join(", ")}`,
        128,
        "You are a gameshow host responsible for illustrating quiz questions using images. Return your response in JSON in the format {requiresImage:boolean, imageDescription:string}",
        true
      );
      const imageDescJSON = JSON.parse(imageDesc);
      console.log(imageDescJSON);
      if (imageDescJSON.requiresImage) {
        const img = await generateImageFal(
          imageDescJSON.imageDescription,
          {
            width: 512,
            height: 512,
          },
          "fast-turbo-diffusion"
        );
        //upload to supabase
        const res = await uploadImageToSupabase(question.question, img);

        imageUrl = `https://fsqgenrxuhqhffkevrbp.supabase.co/storage/v1/object/public/images/${res.path}`;
        setImg(imageUrl);
      }
    } catch (e) {
      console.error(e);
    } finally {
      const { data, error } = await supabase
        .from("question")
        .insert({
          quiz_id: quiz.id,
          theme: question.theme,
          type: question.type,
          question: question.question,
          answers: question.answers,
          correct_answer: question.correct_answer,
          points: question.points,
          image: imageUrl,
        })
        .select()
        .single();
      if (data) {
        setQuestions([...questions, data]);
      }
    }
  };

  if (!quiz || !player) return <div>Creating Quiz...</div>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="z-10 max-w-2xl w-full items-start justify-between font-mono text-sm lg:flex lg:flex-col gap-4 ">
        <div className="flex flex-col gap-4 w-full">
          <h1>Hosting {quiz && `${player.player_name}s`} Game</h1>
          <button
            onClick={quiz.status === "playing" ? stopGame : startGame}
            disabled={!quiz}
            className="p-2 text-white font-semibold rounded-lg bg-blue-500 mb-2 w-full shadow hover:shadow-lg transition"
          >
            {quiz.status === "playing" ? "End Game" : "Start Game"}
          </button>
          {img && <img src={img} className="w-full" />}
          {quiz.status === "playing" && (
            <QuestionAnswer
              questionTime={questionTime}
              onQuestion={handleQuestion}
              onAnswer={handleAnswer}
              playerData={players.map((p) => p.player_data)}
            />
          )}
        </div>

        {players && quiz && (
          <PlayerList initPlayers={players} quiz={quiz} playerId={player.id} />
        )}
      </div>
    </main>
  );
}
