import { useEffect, useRef, useState } from "react";

export type AuraModel =
  | "aura-asteria-en"
  | "aura-luna-en"
  | "aura-stella-en"
  | "aura-athena-en"
  | "aura-hera-en"
  | "aura-orion-en"
  | "aura-arcas-en"
  | "aura-perseus-en"
  | "aura-angus-en"
  | "aura-orpheus-en"
  | "aura-helios-en"
  | "aura-zeus-en";

export default function TextToSpeech({
  text,
  model = "aura-luna-en",
  showControls,
  autoPlay,
  handleEnded,
}: {
  text: string;
  model?: AuraModel;
  showControls: boolean;
  autoPlay: boolean;
  handleEnded?: () => void;
}) {
  const [audioURL, setAudioURL] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const generateAudio = async () => {
      try {
        const response = await fetch("/api/deepgram", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text,
            model: model,
          }),
        });
        const audioUrl = await getAudioUrl(response!.body!);
        setAudioURL(audioUrl);
      } catch (e) {
        console.error(
          "failed to generate deepgram audio, skipping this caption",
          e
        );
        handleEnded && handleEnded();
      }
    };
    if (text && text !== "") generateAudio();
  }, [text]);

  if (!audioURL) return <div>Loading...</div>;
  return (
    <audio
      ref={audioRef}
      className="w-full p-2"
      src={audioURL}
      controls={showControls}
      autoPlay={autoPlay}
      onEnded={handleEnded}
    />
  );
}

const getAudioUrl = async (response: ReadableStream<Uint8Array>) => {
  const reader = response.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const buffer = Buffer.concat(chunks);
  const blob = new Blob([buffer], { type: "audio/wav" });
  // Generate a URL from the Blob
  return URL.createObjectURL(blob);
};
