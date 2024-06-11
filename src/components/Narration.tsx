"use client";
import Caption from "./Caption";
import { useEffect, useState } from "react";
import { getGeminiVision } from "@/ai/gemini";
import Animation from "./Animation";

export type Event = {
  title: string;
  influence: "Positive" | "Negative" | "Neutral";
  description: string;
};

export default function Narration({
  play = true,
  textToNarrate,
  captionPrompt,
  imagePrompt,
  onNarration,
  onCompleteLine,
  events, // Add this prop
}: {
  play?: boolean;
  textToNarrate: string;
  captionPrompt: string;
  imagePrompt: string;
  onNarration?: (narration: string) => void;
  onCompleteLine?: (line: string, nextLine: string) => void;
  events: Event[]; // Add this prop type
}) {
  const [script, setScript] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState<number>(0);
  const [currentText, setCurrentText] = useState<string | null>(null);

  useEffect(() => {
    if (!play) return;
    const generateNarrative = async () => {
      const combinedInput = {
        graph: textToNarrate,
        events: events,
      };
      const description = await getGeminiVision(
        JSON.stringify(combinedInput),
        undefined,
        captionPrompt
      );
      setScript(description.split("\n").filter((line) => line !== ""));
      setCurrentLine(0);
      setCurrentText(description.split("\n")[0]);
      if (onNarration) onNarration(description);
    };

    generateNarrative();
  }, [textToNarrate, play, events]);

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
