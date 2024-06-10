import { useState } from "react";
import { generateImageFal } from "@/ai/fal";

const strategies = [
  { icon: "🍄", text: "Mushroom Cultivation", 
    prompt: "On wildfire burnt land and cool burnt land, Mushroom Cultivation can be introduced to Healesville, Victoria, as mushrooms can benefit from the burnt land, which is a suitable solution turning wildfire influences from negative to positive," },
  { icon: "🔥", text: "Biochar Production", 
    prompt: "Produced by burning organic material at a high temperature with little or no oxygen present, Biochar Production can be introduced to Healesville, Victoria, as biochar production can benefit from the recycling of wildfire burnt and cool burnt vegetation, also the trimmed vegetation due to wildfire defensible space," },
  { icon: "🌿", text: "Aboriginal Cool Burning", 
    prompt: "As the fire management using a cool fire, Aboriginal Cool Burning can remove part of the vegetation for wildfire control,  create suitable burnt land for Mushroom Cultivation and Biochar Production, and attract tourist as an activity," },
  { icon: "🏙️", text: "Urban Relocation", 
    prompt: "Usually focusing on inhabitants and infrastructure development, Urban Relocation can help preventing the existing urban areas from the danger of wildfire, moving inhabitants and infrastructure far from the edge of forest," },
  { icon: "🌳", text: "Anti-fire Berm Design", 
    prompt: "As the variant of firebreak and defensible space,  a large scale, dendritical spreading berm and bunker structure design in Healesville. It creates a wildfire-defensible space clearing nearby vegetation, integrates a series of small water reservoirs, contains elevated wildfire observation towers and fast reaction stations, providing anti-fire access for tourists," },
  { icon: "👀", text: "Fire Observation Tower and Fast Reaction Station", 
    prompt: "Located along the long Anti-fire Berm Design through farm to forest, Fire Observation Towers and Fast Reaction Stations can look after both the wildfire and aboriginal cool burning in Healesville," },
  { icon: "♨️", text: "Hot Springs, Spa and accommodation", 
    prompt: "Located along the long Anti-fire Berm Design in forest, Hot Springs, Spa and accommodation provides relaxing and unique fire and wildlife observation to the tourists, using the heat power recycled from Biochar Production and even Wildfire," },
  { icon: "🐾", text: "Wombat Cave Inspired Cave and Tunnel Style Wildlife Sanctuary", 
    prompt: "As Wombat Caves helped wildlife survived during previous wildfire, the Wildlife Sanctuary is inspired and has the Cave, Bunker, and Tunnel integrated structure locates under the Anti-fire Berm Design, which provides sanctuary and habitat for wildlife during wildfire or not," },
];

export default function DesignStrategy() {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const generateContent = async (prompt: string) => {
    const stylePrompt = `A press-quality realistic photograph of the "${prompt}" strategy application scene in Healesville, Canon EOS 5D Mark IV, 24mm, f/8, 1/250s, ISO 100, 2019`;
    try {
      const imageUrl = await generateImageFal(
        stylePrompt, 
        { width: 512, height: 512 }, 
        "fast-turbo-diffusion", 
        "cartoon, illustration, animation, face, male, female, ugly"
      );
      setGeneratedImage(imageUrl);

      const response = await fetch("/api/deepgram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: prompt, model: "aura-orion-en" }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      } else {
        console.error("Error generating audio");
      }
    } catch (error) {
      console.error("Error generating content:", error);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 m-4 bg-white bg-opacity-75 p-4 rounded shadow-md">
      <table className="table-auto">
        <tbody>
          {strategies.map((strategy, index) => (
            <tr key={index}>
              <td className="pr-2">{strategy.icon}</td>
              <td>
                <button
                  onClick={() => {
                    setSelectedStrategy(strategy.prompt);
                    generateContent(strategy.prompt);
                  }}
                  className="text-black hover:underline"
                >
                  {strategy.text}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {generatedImage && (
        <div className="mt-4">
          <img src={generatedImage} alt="Generated" className="max-w-xs mx-auto" />
          {audioUrl && <audio src={audioUrl} autoPlay />}
        </div>
      )}
    </div>
  );
}