"use server";
import OpenAI from "openai";
import { LLMRequest } from "./types";
import { ImageGenerateParams } from "openai/resources/images.mjs";

const openai_key = process.env.OPENAI;

const openai = new OpenAI({
  apiKey: openai_key,
});

//We can call the openAI API and pass our user prompt, max tokens and system prompt.
export async function getOpenAICompletion(
  userPrompt: string,
  max_tokens: number,
  systemPrompt: string = "",
  jsonOnly: boolean = false,
  image_url: string = ""
) {
  const content = [{ type: "text", text: userPrompt }] as any[];
  if (image_url !== "")
    content.push({
      type: "image_url",
      image_url: { url: image_url, detail: "low" },
    });

  const body = {
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: content,
      },
    ],
    model: "gpt-4o",
    max_tokens: max_tokens,
  } as LLMRequest;

  if (jsonOnly) body.response_format = { type: "json_object" };
  const completion = await openai.chat.completions.create(body);
  return (
    completion.choices[0]?.message?.content || "Oops, something went wrong."
  );
}

export async function generateImageDalle(
  prompt: string,
  model: string,
  size: ImageGenerateParams["size"] = "1024x1024"
) {
  const img = await openai.images.generate({
    model: model,
    prompt: prompt,
    size: size,
  });
  return img.data[0].url;
}
