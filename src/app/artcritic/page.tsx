"use client";

import { useState } from "react";
import { describeImagePrompt } from "@/ai/prompts";
import ImageGallery from "@/components/ImageGallery";
import { getGroqCompletion } from "@/ai/groq";
import { generateImageFal } from "@/ai/fal";
import { getGeminiVision } from "@/ai/gemini";
import GenerateTagCloud from "@/components/TagCloud";
import { saveArtwork } from "./supabaseArt";
import TextToSpeech from "@/components/TextToSpeech";
import Blend from "@/components/Blend";

type Artwork = {
  description: string;
  imageUrl: string;
  critique: string;
  score: string;
};

//An example of making an art critic game

export default function ArtcriticPage() {
  const [keywords, setKeywords] = useState<string>("Selected Keywords...");
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [description, setDescription] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [valuation, setValuation] = useState<string>("");
  const [score, setScore] = useState<string>("0.00");
  const [message, setMessage] = useState<string>("Create Artwork");

  async function handleCreate() {
    setMessage("Generating artwork...");
    //generate the image description
    const description = await getGroqCompletion(
      `Describe an artpiece that includes: ${keywords}`,
      64,
      describeImagePrompt
    );

    setDescription(description);
    //create the image
    const imageUrl = await generateImageFal(description);
    setImageUrl(imageUrl);

    setMessage("Valuing artwork...");

    const critique = await getGeminiVision(
      "Briefly describe the artwork. Be very opinionated about its merits or failings and estimate an auction value in dollars.",
      imageUrl
    );

    setValuation(critique);

    const valueNumber = await getGroqCompletion(
      `A description of an artwork and estimate of its value at auction is: ${critique}. `,
      8,
      "Return the numerical value of the artwork with no other text or explanation. Do not output a range. Output a best guess single number. Do not output dollar signs. The response must cast to a number format. "
    );

    console.log(valueNumber);

    setScore(`$${valueNumber}`);

    //lets save this into our database!
    saveArtwork(Number(valueNumber), imageUrl, description, keywords);

    //update the artwork object and add to our state to display it
    const newArtwork = {
      description,
      imageUrl,
      critique,
      score: `$${valueNumber}`,
    };

    setArtworks([...artworks, newArtwork]);
    setMessage("Create Artwork");

    console.log(artworks);
  }

  const setSelectedArtwork = (selectedArtwork: Artwork) => {
    setDescription(selectedArtwork.description);
    setImageUrl(selectedArtwork.imageUrl);
    setValuation(selectedArtwork.critique);
    setScore(selectedArtwork.score);
  };

  return (
    <main className="flex min-h-screen flex-col items-end justify-between p-24">
      <div className="z-10 max-w-lg w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col">
          <GenerateTagCloud
            prompt="Art styles, art aesthetics, vivid descriptive adjectives"
            totalTags={100}
            handleSelect={(tags) => setKeywords(tags.join(", "))}
          />
          <button className="p-4" onClick={handleCreate}>
            {message}
          </button>

          <div className="flex flex-col pb-4">
            <span>{valuation}</span>
            {valuation != "" && (
              <TextToSpeech
                text={valuation}
                showControls={false}
                autoPlay={true}
              />
            )}

            {imageUrl && (
              <Blend contentKey={imageUrl.slice(-20)}>
                <img className="w-full  h-full  object-cover" src={imageUrl} />
              </Blend>
            )}
          </div>
          <ImageGallery
            images={artworks.map((a) => ({ src: a.imageUrl, title: a.score }))}
            handleClickImage={(id) => setSelectedArtwork(artworks[id])}
          />
        </div>
      </div>
    </main>
  );
}
