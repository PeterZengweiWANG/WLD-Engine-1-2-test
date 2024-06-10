"use client";
import Blend from "@/components/Blend";
import SketchToImage from "@/components/SketchToImage";
import { useState } from "react";

export default function Page() {
  const [image, setImage] = useState<string>("");
  const [prompt, setPrompt] = useState<string>(
    "a masterful piece of art, dutch realism, oil on canvas"
  );

  const onCreate = (img: string) => {
    setImage(img);
  };

  return (
    <main className="flex min-h-screen flex-col items-end justify-between p-24">
      <div className="z-10 max-w-lg w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col w-full">
          <input
            className="p-2 mb-2 rounded-lg"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <SketchToImage prompt={prompt} onCreate={onCreate} />
          <Blend contentKey={image.slice(-20)}>
            <img className="w-full  h-full  object-cover" src={image} />
          </Blend>
        </div>
      </div>
    </main>
  );
}
