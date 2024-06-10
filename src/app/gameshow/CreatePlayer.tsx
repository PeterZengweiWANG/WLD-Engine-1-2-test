"use client";
import { Player } from "@/components/QuestionAnswer";
import { useState } from "react";
import supabase from "@/supabase/supabaseClient";
import Link from "next/link";
import { generateImageFal } from "@/ai/fal";
import { useRouter } from "next/navigation";

export default function CreatePlayer() {
  const [playerName, setPlayerName] = useState<string>("");
  const [expertise, setExpertise] = useState<string>("");
  const [player, setPlayer] = useState<Player | null>(null);
  const [creating, setCreating] = useState<boolean>(false);

  const router = useRouter();

  const createPlayer = async () => {
    //create an image for the player
    setCreating(true);
    try {
      const img = await generateImageFal(
        `${expertise}`,
        {
          width: 512,
          height: 512,
        },
        "fast-turbo-diffusion"
      );

      //upload to supabase
      const imgUrl = await uploadImageToSupabase(playerName, img);
      //Create new player in supabase
      const { data, error } = await supabase
        .from("player")
        .insert({
          player_name: playerName,
          player_data: expertise,
          image: `https://fsqgenrxuhqhffkevrbp.supabase.co/storage/v1/object/public/images/${imgUrl.path}`,
          status: "playing",
          score: 0,
        })
        .select()
        .single();
      if (data) {
        setPlayer(data);
      }
    } catch (e) {
      console.error(e);
      setPlayer(null);
      setPlayerName("");
      setExpertise("");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {!player ? (
        <>
          <input
            className="p-2 border rounded-lg bg-white/25 mb-2 w-full"
            type="text"
            value={playerName}
            placeholder={"Your name"}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <input
            className="p-2 border rounded-lg bg-white/25 mb-2 w-full"
            type="text"
            value={expertise}
            placeholder={"Your special expertise"}
            onChange={(e) => setExpertise(e.target.value)}
          />
          <button
            onClick={createPlayer}
            disabled={!playerName || !expertise}
            className="p-2 border rounded-lg bg-white mb-2 w-full hover:shadow"
          >
            {creating ? "Creating player..." : "Create"}
          </button>
        </>
      ) : (
        <div className="max-w-lg rounded shadow p-4 flex flex-col gap-2">
          <img src={player.image} alt={player.player_name} />
          <p>{player.player_name}</p>
          <p>{player.player_data}</p>
          <Link
            href={`/gameshow/host?player=${player.id}`}
            className="w-full p-2 border rounded-lg hover:shadow bg-white"
          >
            Host a new game
          </Link>
          <Link
            href={`/gameshow/join?player=${player.id}`}
            className="w-full p-2 border rounded-lg hover:shadow bg-white"
          >
            Search for a game
          </Link>
        </div>
      )}
    </div>
  );
}

function base64ToBlob(base64: string, mimeType: string) {
  const byteCharacters = atob(base64.split(",")[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

export async function uploadImageToSupabase(name: string, image: string) {
  const mimeTypeArr = image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
  if (!mimeTypeArr) throw "cannot get mimeType";
  const mimeType = mimeTypeArr[1];
  const blob = base64ToBlob(image, mimeType);
  // Use the Supabase Storage API to upload the blob
  const { data, error } = await supabase.storage
    .from("images")
    .upload(`uploads/${Date.now()}-${name}.jpg`, blob, {
      contentType: mimeType,
    });
  if (error) {
    console.log("upload failed");
    throw error;
  }
  console.log("Upload successful:", data);
  return data;
}
