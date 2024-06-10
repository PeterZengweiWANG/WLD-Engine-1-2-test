"use client";
import { getGeminiVision } from "@/ai/gemini";
import { getOpenAICompletion } from "@/ai/openai";
import SelectImageRegion from "@/components/SelectImageRegion";
import { useState } from "react";

//Demo of generating a map of coordinates that can be selected
export default function WhatsThisPage() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleSelect = async (imgUrl: string) => {
    setDescription("Analyzing...");

    const description = await getGeminiVision(
      "Briefly describe the image. Guess where in the world it is located.",
      imgUrl
    );
    /*
    //Open AI option
    const description = await getOpenAICompletion(
      "briefly describe the image. Guess where in the world it is located.",
      128,
      "",
      false,
      imgUrl
    );
    */
    setDescription(description);
    setImageUrl(imgUrl);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col gap-4">
          <span className="text max-w-sm">{description}</span>
          <SelectImageRegion img="/sat.jpg" onSelect={handleSelect} />
        </div>
      </div>
    </main>
  );
}
