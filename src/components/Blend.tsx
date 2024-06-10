"use client";
import React, { ReactNode, useEffect, useMemo } from "react";
import { CrossFade } from "react-crossfade-simple";

const animations = [
  "animate-panR",
  "animate-zoomIn",
  "animate-panL",
  "animate-zoomOut",
];

//blends and animate an new component over the top of any previously rendered component
export default function Blend({
  fullscreen = true,
  children,
  contentKey,
  duration = 2000,
}: {
  fullscreen?: boolean;
  children: ReactNode;
  contentKey: string;
  duration?: number;
}) {
  return (
    <div
      className={`${
        fullscreen
          ? "fixed top-0 left-0 -z-50 min-w-[100vw] min-h-[100vh]"
          : `relative max-w-full w-[1024px] h-[600px] overflow-hidden`
      }`}
    >
      <div className={`${fullscreen && "absolute top-0 left-0"} w-full h-full`}>
        <CrossFade contentKey={contentKey} timeout={duration}>
          {children}
        </CrossFade>
      </div>
    </div>
  );
}

export function AnimatedImage({ src }: { src: string }) {
  const animation = useMemo(
    () => animations[Math.floor(Math.random() * animations.length)],
    []
  );
  return (
    <img className={`w-full h-full object-cover ${animation}`} src={src} />
  );
}
