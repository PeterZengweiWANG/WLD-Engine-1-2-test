import { generateImageFal, generateVideoFal } from "@/ai/fal";
import { getGroqCompletion } from "@/ai/groq";
import { useEffect, useState } from "react";
import Blend, { AnimatedImage } from "./Blend";

type AnimationProps = {
  prompt: string;
  systemPrompt: string;
  width: number;
  height: number;
  refreshRate?: number;
  fullscreen?: boolean;
  onChange?: (url: string) => void;
  video?: boolean;
};

//Component that uses groq to generate image descriptions from prompts, then uses fal to generates the image and blends them together.
//All runs on an animation timer
export default function Animation({
  prompt,
  systemPrompt,
  width,
  height,
  refreshRate = 0,
  fullscreen = true,
  onChange,
  video = false,
}: AnimationProps) {
  const [image, setImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function generateDescription() {
      return await getGroqCompletion(prompt, 32, systemPrompt);
    }
    async function generateImage() {
      //improve image description
      const imageDescription = await generateDescription();
      const url = await generateImageFal(
        imageDescription,
        { width: width, height: height },
        "hyper-sdxl"
      );
      return { imageDescription, url };
    }

    async function generateVideo(url: string) {
      const videoUrl = await generateVideoFal(url, 4);
      return videoUrl;
    }

    if (refreshRate === 0) {
      generateImage().then((img) => {
        setImage(img.url);
        setVideoUrl(null);
        if (video && img.url)
          generateVideo(img.url).then((videoUrl) => {
            setVideoUrl(videoUrl);
          });
      });
    } else {
      const interval = setInterval(async () => {
        const { url } = await generateImage();
        setImage(url); // Set new image
        if (onChange) onChange(url);
      }, refreshRate);

      return () => clearInterval(interval); // Cleanup
    }
  }, [prompt, refreshRate, systemPrompt, width, height, video, onChange]);

  return (
    <Blend
      contentKey={image?.slice(-20) ?? videoUrl ?? ""}
      fullscreen={fullscreen}
      duration={2000}
    >
      {videoUrl ? (
        <VideoComponent image={image ?? ""} videoUrl={videoUrl} />
      ) : (
        <AnimatedImage src={image ?? ""} />
      )}
    </Blend>
  );
}

const VideoComponent = ({
  image,
  videoUrl,
}: {
  image: string;
  videoUrl: string;
}) => {
  return (
    <video
      poster={image ?? ""}
      src={videoUrl}
      autoPlay
      className="w-full h-full object-cover"
      muted
      loop={false}
    />
  );
};
