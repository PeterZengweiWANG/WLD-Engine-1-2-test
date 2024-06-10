"use client";
import { useState, useEffect } from "react";
import * as fal from "@fal-ai/serverless-client";
import Image from "next/image";
import { generateImageFal, generateImageToImageFal } from "@/ai/fal";

fal.config({
  proxyUrl: "/api/fal/proxy",
});

export default function SketchToImage({
  prompt = "masterpice, best quality, A cinematic shot of a baby raccoon wearing an intricate italian priest robe",
  onCreate,
}: {
  prompt: string;
  onCreate(img: string): void;
}) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [excalidrawExportFns, setexcalidrawExportFns] = useState<any>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [Comp, setComp] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    import("@excalidraw/excalidraw").then((comp) => setComp(comp.Excalidraw));
  }, []);
  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    import("@excalidraw/excalidraw").then((module) =>
      setexcalidrawExportFns({
        exportToBlob: module.exportToBlob,
        serializeAsJSON: module.serializeAsJSON,
      })
    );
  }, []);

  async function getDataUrl() {
    const elements = excalidrawAPI.getSceneElements();
    if (!elements || !elements.length) return;
    const blob = await excalidrawExportFns.exportToBlob({
      elements,
      exportPadding: 0,
      quality: 0.5,
      getDimensions: () => {
        return { width: 512, height: 512 };
      },
    });
    return await new Promise((r) => {
      let a = new FileReader();
      a.onload = r;
      a.readAsDataURL(blob);
    }).then((e: any) => {
      return e.target.result;
    });
  }

  const handleCreate = async () => {
    setGenerating(true);
    let dataUrl = await getDataUrl();
    const img = await generateImageToImageFal(prompt, dataUrl);
    onCreate(img);
    setGenerating(false);
  };

  return (
    <div className="">
      <button
        className="mb-2 w-full p-2 bg-white rounded-lg"
        onClick={handleCreate}
      >
        {generating ? "Generating..." : "Create"}
      </button>
      <div className="flex">
        <div className="w-[550px] h-[570px]">
          {isClient && excalidrawExportFns && (
            <Comp excalidrawAPI={(api: any) => setExcalidrawAPI(api)} />
          )}
        </div>
      </div>
    </div>
  );
}
