"use client";
import Caption from "./Caption";
import { useEffect, useState } from "react";
import { getGeminiVision } from "@/ai/gemini";
import Animation from "./Animation";
import { Event } from "./Chronology";

//Component that turns anything into a narrated script

//TODO - add a style prop and a next / prev button incase the narration doesn't play
export default function Narration({
  play = true,
  textToNarrate,
  captionPrompt,
  imagePrompt,
  onNarration,
  onCompleteLine,
  currentEvent,
}: {
  play?: boolean;
  textToNarrate: string;
  captionPrompt: string;
  imagePrompt: string;
  onNarration?: (narration: string) => void;
  onCompleteLine?: (line: string, nextLine: string) => void;
  currentEvent?: Event | null;
}) {
  const [script, setScript] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState<number>(0);
  const [currentText, setCurrentText] = useState<string | null>(null);

  useEffect(() => {
    //generate the narrative
    if (!play) return;
    const generateNarrative = async () => {
      const description = await getGeminiVision(
        JSON.stringify({ graph: textToNarrate, currentEvent }),
        undefined,
        captionPrompt
      );
      //filter empty lines
      setScript(description.split("\n").filter((line) => line !== ""));
      console.log(
        "Generated Script",
        description.split("\n").filter((line) => line !== "")
      );
      setCurrentLine(0);
      setCurrentText(description.split("\n")[0]);
      if (onNarration) onNarration(description);
    };

    generateNarrative();
  }, [textToNarrate, play, currentEvent]);

  const handleReadText = () => {
    if (currentLine < script.length - 1) {
      setCurrentLine(currentLine + 1);
      setCurrentText(script[currentLine + 1]);
      if (onCompleteLine)
        onCompleteLine(script[currentLine], script[currentLine + 1]);
    }
  };

  useEffect(() => {
    console.log("current text", currentText);
  }, [currentText]);
  return (
    <>
      {currentText && play && (
        <>
          <Caption
            text={script[currentLine]}
            speech
            onComplete={handleReadText}
          />
          <Animation
            prompt={script[currentLine]}
            systemPrompt={imagePrompt}
            width={1344}
            height={1024}
            video={false}
          />
        </>
      )}
    </>
  );
}