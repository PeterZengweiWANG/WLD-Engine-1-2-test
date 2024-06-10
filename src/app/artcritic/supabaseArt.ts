"use server";
import supabase from "@/supabase/supabase";

//These functions are specific to my supabase project and save the images generated in the art critic example to a table called Map.
//If you want to work with supabase, you will likely need some help getting your database set up on discord.

export async function saveArtwork(
  valueNumber: number,
  imageUrl: string,
  description: string,
  keywords: string
) {
  const { data, error } = await supabase
    .from("art")
    .insert([
      {
        value: Number(valueNumber),
        image: imageUrl,
        description: description,
        prompt: keywords,
      },
    ])
    .select();
}

function mimeTypeToExtension(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
  }
  return "";
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
