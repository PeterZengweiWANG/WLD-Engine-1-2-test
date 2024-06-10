"use client";
import { getPanorama } from "@/ai/blockade";
import {
  creativeUpscale,
  generateImageFal,
  generateImageToImageFal,
} from "@/ai/fal";
import { getGeminiVision } from "@/ai/gemini";
import Panorama from "@/components/Panorama";
import Spinner from "@/components/Spinner";
import { useState } from "react";

export default function App() {
  const [fetching, setFetching] = useState<boolean>(false);
  const [img, setImg] = useState<string>("/old_depot_2k.hdr");
  const [prompt, setPrompt] = useState<string>("a beautiful underwater reef");
  const [selectedImg, setSelectedImage] = useState<string>("");
  const [description, setDescription] = useState<string>(
    "Hold shift and drag to screencap"
  );
  const [immersive, setImmersive] = useState<boolean>(false);
  const [upscaling, setUpscaling] = useState<boolean>(false);
  const [upscale, setUpscale] = useState<boolean>(true);

  const handleCreate = async () => {
    setFetching(true);
    //improve prompt
    const newPrompt =
      "An equirectangular panorama of" +
      prompt +
      ". Canon EOS 5D Mark IV, 24mm, f/8, 1/250s, ISO 100";
    //if immersive, use blockade, otherwise just use fal
    const pano = await (immersive
      ? getPanorama(newPrompt)
      : generateImageFal(newPrompt));
    if (pano) setImg(pano);
    setFetching(false);
  };

  const handleSelect = async (imgUrl: string) => {
    setSelectedImage(imgUrl);
    setUpscaling(true);

    if (!upscale) {
      //Generate a description
      //Use this with image - image
      const description = await getGeminiVision(
        `You will be provided with a screenshot from an image of ${prompt}. Vividly describe the content in the image in as much detail as possible. Your description will be used as a prompt to generate a new image, so avoid negative words like blurry, low res, unclear, etc.`,
        imgUrl
      );
      setDescription(description);
      const pano = await generateImageToImageFal(description, imgUrl, true);
      if (pano) setImg(pano);
    } else {
      //Otherwise just upscale
      const upscaled = await creativeUpscale(imgUrl);
      setSelectedImage(upscaled);
      try {
        const base64 = await convertImageToBase64JPEG(upscaled);
        setImg(base64);
      } catch (e) {
        console.error("error creating new pano", e);
      }
    }
    setUpscaling(false);
  };

  return (
    <>
      <main className="flex flex-col w-full h-screen min-h-screen">
        <div className="flex justify-between gap-4 m-2">
          <input
            className="w-full rounded"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          ></input>
          <button
            disabled={fetching}
            className="p-2 w-full rounded bg-white"
            onClick={handleCreate}
          >
            {fetching ? "Generating skybox..." : "Create"}
          </button>
          <button
            className="p-2 w-full rounded bg-white"
            onClick={() => {
              var a = document.createElement("a");
              a.href = img;
              a.download = "Image.png";
              a.click();
            }}
          >
            Download Img
          </button>
        </div>
        <div className="relative w-full h-full">
          <Panorama img={img} onSelect={handleSelect} immersive={immersive} />
          <div className="absolute top-0 left-0 p-4 flex flex-col max-w-sm">
            <p className="text-xs bg-white p-2">{description}</p>
            <div className="relative">
              {selectedImg && (
                <img className="w-full h-full" src={selectedImg} />
              )}
              {upscaling && (
                <div className="absolute inset-0 flex justify-center items-center">
                  <Spinner />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

async function convertImageToBase64JPEG(url: string) {
  try {
    // Create an HTMLImageElement
    const img = new Image();
    img.src = url;
    img.crossOrigin = "anonymous";
    return new Promise<string>((resolve, reject) => {
      img.onload = () => {
        // Draw the image on a canvas
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        // Convert the canvas to a base64 JPEG
        const jpegBase64 = canvas.toDataURL("image/jpeg");
        resolve(jpegBase64);
      };

      img.onerror = (error) => {
        reject(error);
      };
    });
  } catch (error) {
    console.error("Error converting image:", error);
    throw error;
  }
}
