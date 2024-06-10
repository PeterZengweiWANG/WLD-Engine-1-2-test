"use client";
import { generateImageFal } from "@/ai/fal";
import { getGeminiVision } from "@/ai/gemini";
import { getGroqCompletion } from "@/ai/groq";
import { generateImageDalle, getOpenAICompletion } from "@/ai/openai";
import Spinner from "@/components/Spinner";
import { useState } from "react";

//compare response times for different text and image generation models
export default function Page() {
  const [groqMixtral, setGroq8] = useState<string | null>();
  const [groqLlama, setGroq70] = useState<string | null>();
  const [openAI, setOpenAI] = useState<string | null>();
  const [gemini, setGemini] = useState<string | null>(null);
  const [firstRun, setFirstRun] = useState<boolean>(true);
  const handleRunTest = async () => {
    setGroq8(null);
    setGroq70(null);
    setOpenAI(null);
    setGemini(null);
    setFirstRun(false);
    const prompt =
      "Write a short synopsis of a documenary film covering the development of the aquaculture industry in Norway from 2025 to 2060. Include the main themes, key events, and the impact of the industry on the environment and society. The synopsis should be engaging and informative, providing a clear overview of the film's content and themes.";
    let time = new Date().getTime();

    const groqResponse = await getGroqCompletion(
      prompt,
      512,
      "",
      false,
      "mixtral-8x7b-32768"
    );
    setGroq8(`Time: ${new Date().getTime() - time}ms - ${groqResponse}`);

    time = new Date().getTime();
    const groqResponse70 = await getGroqCompletion(prompt, 512);
    setGroq70(`Time: ${new Date().getTime() - time}ms - ${groqResponse70}`);

    time = new Date().getTime();
    const geminiResponse = await getGeminiVision(prompt);
    setGemini(`Time: ${new Date().getTime() - time}ms - ${geminiResponse}`);

    time = new Date().getTime();
    const openAIResponse = await getOpenAICompletion(prompt, 512);
    setOpenAI(`Time: ${new Date().getTime() - time}ms - ${openAIResponse}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center  p-24">
      <button className="bg-white rounded-lg p-2 mb-4" onClick={handleRunTest}>
        {firstRun == false &&
        (groqMixtral == null ||
          groqLlama == null ||
          openAI == null ||
          gemini == null)
          ? "Generating..."
          : "Run Test"}
      </button>
      {!firstRun && (
        <div className="z-10 w-full grid grid-cols-2 gap-4">
          <TestText text={groqMixtral} title="Groq Mixtral" />
          <TestText text={groqLlama} title="Groq Lllama 70b" />
          <TestText text={gemini} title="Gemini Flas" />
          <TestText text={openAI} title="OpenAI GPT4-o" />
        </div>
      )}
    </main>
  );
}

function TestText({
  text,
  title,
}: {
  text: string | undefined | null;
  title: string;
}) {
  return (
    <div className="relative w-full min-h-[128px]">
      <h1>{title}</h1>
      {text && <p className="w-full">{text}</p>}
      {!text && (
        <div className="absolute inset-0 flex justify-center items-center">
          <Spinner />
        </div>
      )}
    </div>
  );
}
