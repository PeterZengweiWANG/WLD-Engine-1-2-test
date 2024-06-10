"use client";
import { useState } from "react";
import * as fal from "@fal-ai/serverless-client";
import Blend from "@/components/Blend";

fal.config({
  proxyUrl: "/api/fal/proxy",
});

const seed = Math.floor(Math.random() * 100000);
const baseArgs = {
  sync_mode: true,
  strength: 0.99,
  seed,
};
export default function Home() {
  const [input, setInput] = useState(
    "masterpice, best quality, A cinematic shot of a baby raccoon wearing an intricate italian priest robe"
  );
  const [image, setImage] = useState<string | null>(null);

  const connection = fal.realtime.connect("fal-ai/fast-turbo-diffusion", {
    onResult: (result) => {
      console.log(result);
      const uint8Array = result.images[0].content;
      const blob = new Blob(
        [
          uint8Array.buffer.slice(
            uint8Array.byteOffset,
            uint8Array.byteOffset + uint8Array.byteLength
          ),
        ],
        { type: "image/jpeg" }
      ); // Adjust the MIME type as necessary

      // Step 2: Create a URL from the Blob
      const imageUrl = URL.createObjectURL(blob);
      setImage(imageUrl);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return (
    <main className="p-12">
      <p className="text-xl mb-2">Fal SDXL Turbo</p>
      <input
        className="border rounded-lg p-2 w-full mb-2 bg-transparent"
        value={input}
        onChange={async (e) => {
          setInput(e.target.value);
          connection.send({
            _binary: new Uint8Array(),
            prompt: e.target.value,
            seed: seed,
          });
        }}
      />

      {image && (
        <Blend contentKey={input}>
          <img className="w-full  h-full  object-cover" src={image} />
        </Blend>
      )}
    </main>
  );
}
