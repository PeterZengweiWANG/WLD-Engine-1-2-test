"use server";
import { createClient } from "@deepgram/sdk";

const deepgram = createClient(process.env.DEEPGRAM ?? "");

export async function POST(request: Request) {
  try {
    const { text, model } = await request.json();

    if (!text) throw "No text provided";
    const response = await deepgram.speak.request(
      { text },
      {
        model: model,
        encoding: "linear16",
        container: "wav",
      }
    );
    const stream = await response.getStream();
    const headers = await response.getHeaders();
    if (stream) {
      return new Response(stream, {
        headers: {
          "Content-Type": "audio/wav",
        },
      });
    }
    throw "No stream returned";
  } catch (error) {
    console.error("The API returned an error: " + error);
    return new Response(
      JSON.stringify({
        error: `The API returned an error: ${error}`,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
