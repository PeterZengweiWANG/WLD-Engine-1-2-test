"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import KeywordBackground from "@/components/KeywordBackground";

export default function Home() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleClick = () => {
      router.push("/timeline/startpage");
    };
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("click", handleClick);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative cursor-pointer bg-gray-900">
      <KeywordBackground />
      <div className="text-8xl font-bold text-center mb-32 animate-pulse cinzel-text text-white">
        Light Up Healesville
      </div>
      <div className="text-2xl font-bold text-center animate-pulse cinzel-text text-white">
        --- PRESS ANYWHERE TO START ---
      </div>
      <div
        className="absolute w-24 h-24 bg-contain bg-center bg-no-repeat"
        style={{
          left: mousePosition.x - 48,
          top: mousePosition.y - 72,
          backgroundImage: 'url("/img/fireicon.gif")',
        }}
      ></div>
    </main>
  );
}