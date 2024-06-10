"use client";

import { useState } from "react";
import { describeImagePrompt } from "@/ai/prompts";
import TagCloud from "@/components/TagCloud";
import Animation from "@/components/Animation";

//An example of using the tag cloud and fast image component to generate a timelapse of images

export default function TimelapsePage() {
  const [keywords, setKeywords] = useState<string>("Landscape");
  const [year, setYear] = useState<number>(2024);
  const [animateImages, setAnimateImages] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  return (
    <main className="relative flex min-h-screen flex-col items-end justify-between p-24">
      <div className="z-10 max-w-lg w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <button
              className={`m-2 p-2 w-full bg-white rounded-lg hover:shadow ${
                animateImages && "bg-red-600"
              }`}
              onClick={() => setAnimateImages(!animateImages)}
            >
              {animateImages ? "Stop" : "Play"} (year: {year.toString()})
            </button>
            <button
              className={`m-2 p-2 bg-white rounded-lg hover:shadow`}
              onClick={() => setFullscreen(!fullscreen)}
            >
              {fullscreen ? "Boxed" : "Fullscreen"}
            </button>
          </div>
          <TagCloud
            prompt="A cityscape"
            totalTags={20}
            handleSelect={(tags) => setKeywords(tags.join(", "))}
          />
          <Animation
            prompt={`${keywords}, year ${year.toString()}`}
            systemPrompt={describeImagePrompt}
            width={1344}
            height={1024}
            refreshRate={animateImages ? 5000 : 0}
            fullscreen={fullscreen}
            onChange={(url) => setYear((year) => year + 5)}
          />
        </div>
      </div>
    </main>
  );
}
