"use client";
import React, { useState, useRef } from "react";

export interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function SelectImageRegion({
  img,
  onSelect,
}: {
  img: string;
  onSelect: (imgUrl: string) => void;
}) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionArea, setSelectionArea] = useState<SelectionArea>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startSelection = (event: React.MouseEvent) => {
    event.preventDefault();
    const rect = imgRef.current!.getBoundingClientRect();
    setSelectionArea({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      width: 0,
      height: 0,
    });
    setIsSelecting(true);
  };

  const updateSelection = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!isSelecting) return;
    const rect = imgRef.current!.getBoundingClientRect();
    setSelectionArea((prev) => ({
      ...prev,
      width: event.clientX - rect.left - prev.x,
      height: event.clientY - rect.top - prev.y,
    }));
  };

  const endSelection = () => {
    if (canvasRef.current && imgRef.current) {
      const ctx = canvasRef.current.getContext("2d")!;
      canvasRef.current.width = Math.abs(selectionArea.width);
      canvasRef.current.height = Math.abs(selectionArea.height);
      ctx.drawImage(
        imgRef.current,
        selectionArea.x,
        selectionArea.y,
        selectionArea.width,
        selectionArea.height,
        0,
        0,
        Math.abs(selectionArea.width),
        Math.abs(selectionArea.height)
      );
      //call the callback function and provide the image
      onSelect(canvasRef.current.toDataURL("image/png"));
    }
    setIsSelecting(false);
  };

  return (
    <div className="relative flex flex-col gap-4">
      <img
        ref={imgRef}
        src={img}
        crossOrigin="anonymous" // This line is important
        onMouseDown={startSelection}
        onMouseMove={updateSelection}
        onMouseUp={endSelection}
        style={{ cursor: isSelecting ? "crosshair" : "default" }}
      />
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
      {isSelecting && (
        <div
          className="absolute border-2 border-white border-dashed pointer-events-none"
          style={{
            left:
              selectionArea.width > 0
                ? selectionArea.x + "px"
                : selectionArea.x + selectionArea.width + "px",
            top:
              selectionArea.height > 0
                ? selectionArea.y + "px"
                : selectionArea.y + selectionArea.height + "px",
            width: Math.abs(selectionArea.width) + "px",
            height: Math.abs(selectionArea.height) + "px",
          }}
        ></div>
      )}
    </div>
  );
}
