"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI ?? "");

//models - gemini-pro-vision, gemini-1.5-flash-latest

export async function getGeminiVision(
  prompt: string,
  base64Image: string | undefined = undefined,
  systemPrompt: string = "",
  json: boolean = false
) {
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: json ? "application/json" : "text/plain",
  };
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    systemInstruction: systemPrompt,
    generationConfig,
  });

  const body = [prompt] as any[];
  if (base64Image) {
    const formatted = base64Image.split(",")[1];
    const image = {
      inlineData: {
        data: formatted,
        mimeType: "image/jpeg",
      },
    };
    body.push(image);
  }

  const result = await model.generateContent(body);
  return result.response.text();
}
