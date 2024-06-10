"use client";

import { useState } from "react";
import Link from "next/link";
import MasterPlan from "@/components/MasterPlan";
import DesignStrategy from "@/components/DesignStrategy";

const images = [
  "/presentation/skye00000_In_the_beautiful.png",
  "/presentation/skye00000_Press_quality_photography.png",
  "/presentation/skye00000_Imagine_standing.png",
  // Add more presentation images, path: public\presentation
];

export default function PresentationPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAlbum, setShowAlbum] = useState(false);
  const [showMasterPlan, setShowMasterPlan] = useState(false);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setShowAlbum(false);
  };

  return (
    <main className="relative flex items-center justify-center h-screen w-full bg-black">
      {!showAlbum && !showMasterPlan ? (
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="object-cover w-full h-full"
          onClick={(e) => {
            const { clientX, currentTarget } = e;
            if (clientX < currentTarget.clientWidth / 2) {
              handlePrevious();
            } else {
              handleNext();
            }
          }}
        />
      ) : showAlbum ? (
        <div className="grid grid-cols-2 gap-4 p-4">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="object-cover w-full h-auto cursor-pointer"
              onClick={() => handleImageClick(index)}
            />
          ))}
        </div>
      ) : (
        <>
          <MasterPlan />
          <DesignStrategy />
        </>
      )}
      <div className="absolute top-4 right-4 flex space-x-8 cinzel-text text-2xl font-bold px-4 py-2 text-white">
        <Link href="/timeline/startpage">Return</Link>
        <button onClick={() => setShowMasterPlan(!showMasterPlan)}>
          MasterPlan
        </button>
        <button onClick={() => setShowAlbum(!showAlbum)}>Album</button>
      </div>
    </main>
  );
}