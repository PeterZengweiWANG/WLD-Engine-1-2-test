//Component for displaying and updating game state

import { getGroqCompletion } from "@/ai/groq";
import { useEffect, useState } from "react";

//Runs a callback function whenever the state updates
export default function GameState({
  prompt,
  systemPrompt,
  maxTokens,
  jsonOnly,
  initState,
  onStateChange,
}: {
  prompt: string;
  systemPrompt: string;
  maxTokens: number;
  jsonOnly: boolean;
  initState: any;
  onStateChange: (state: any) => void;
}) {
  const [gameState, setGameState] = useState(initState);

  //update the game state whenever the props change
  useEffect(() => {
    //request new game state from ai
    getGroqCompletion(prompt, maxTokens, systemPrompt, jsonOnly).then(
      (response) => {
        const newGameState = JSON.parse(response);
        setGameState(newGameState);
        onStateChange(newGameState);
      }
    );
  }, [prompt, systemPrompt]);

  //iterate over gameState key values and render them
  return (
    <div>
      {Object.keys(gameState).map((key) => (
        <div key={key}>
          <span>{key}: </span>
          <span>{gameState[key]}</span>
        </div>
      ))}
    </div>
  );
}
