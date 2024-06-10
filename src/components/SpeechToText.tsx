"use client";
import React, { useState, useRef, useEffect } from "react";
import * as fal from "@fal-ai/serverless-client";
import Spinner from "./Spinner";

fal.config({
  proxyUrl: "/api/fal/proxy",
});

export default function SpeechToText({
  onTranscribed,
}: {
  onTranscribed?: (transcription: string) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string>("");

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      audioChunksRef.current = [];
      if (!audioBlob) return;
      setIsTranscribing(true);
      const dataURI = await convertBlobToBase64(audioBlob);
      const transcribeAudio = (await fal.run("fal-ai/whisper", {
        input: {
          audio_url: dataURI,
        },
      })) as any;
      console.log(transcribeAudio);
      setTranscription(transcribeAudio.text);
      onTranscribed?.(transcribeAudio.text);
      setIsTranscribing(false);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    mediaRecorderRef?.current?.stop();
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="p-4 w-full flex flex-col gap-4">
      <button className="bg-white p-2 rounded" onClick={toggleRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      {isRecording && <Spinner />}
      <span>{isTranscribing ? "Transcribing..." : transcription}</span>
    </div>
  );
}

function convertBlobToBase64(blob: Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      // The result attribute contains the data as a base64 encoded string
      resolve(reader.result);
    };
    console.log("reading file");
    reader.readAsDataURL(blob);
  });
}
