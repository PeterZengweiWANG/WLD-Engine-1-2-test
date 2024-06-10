"use client";
import SpeechToText from "@/components/SpeechToText";

export default function SpeechPage() {
  const handleTranscription = (transcription: string) => {
    //do whatever you want here
  };
  return (
    <main className="flex min-h-screen flex-col items-end justify-between p-24">
      <div className="z-10 max-w-lg w-full items-center justify-between font-mono text-sm lg:flex">
        <SpeechToText onTranscribed={handleTranscription} />
      </div>
    </main>
  );
}
