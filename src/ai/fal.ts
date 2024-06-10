"use server";

import * as fal from "@fal-ai/serverless-client";
const fal_key = process.env.FAL_KEY ?? process.env.FAL ?? "";

fal.config({
  credentials: fal_key, // or a function that returns a string
});

type Image = {
  url: string;
  file_name: string;
  file_size: number;
};

type Result = {
  images: Image[];
};

type UpscaleResult = {
  image: Image;
};

type VideoResult = {
  video: Image;
};

// This function makes a request to the FAL api and gets an image.
export async function generateImageFal(
  prompt: string,
  image_size: { width: number; height: number } = { width: 1344, height: 1024 },
  model: "fast-turbo-diffusion" | "hyper-sdxl" | "fast-sdxl" = "hyper-sdxl",
  negative_prompt: string = "cartoon, illustration, animation, face, male, female, ugly"
) {
  const result: Result = await fal.run(`fal-ai/${model}`, {
    input: {
      prompt: prompt,
      negative_prompt: negative_prompt,
      image_size: image_size,
      sync_mode: true,
      num_inference_steps: 4,
    },
  });

  return result.images[0].url;
}

const seed = Math.floor(Math.random() * 100000);

// This function makes a request to the FAL api and gets an image.
export async function generateImageToImageFal(
  prompt: string,
  image_url: string,
  randomSeed: boolean = false
) {
  const generationSeed = randomSeed ? Math.floor(Math.random() * 100000) : seed;
  const result: Result = await fal.run(`fal-ai/lcm-sd15-i2i`, {
    input: {
      prompt: prompt,
      image_url: image_url,
      strength: 0.99,
      sync_mode: true,
      seed: generationSeed,
      negative_prompt:
        "cartoon, illustration, animation, face, male, female, ugly",
    },
  });
  return result.images[0].url;
}

export type UpscaleOptions = {
  prompt?: string;
  scale?: number;
  creativity?: number;
  detail?: number;
  shape_preservation?: number;
  num_inference_steps?: number;
  skip_ccsr?: boolean;
};

// This function makes a request to the FAL api and gets an image.
export async function creativeUpscale(
  image_url: string,
  options: UpscaleOptions = {
    scale: 2,
    creativity: 0.5,
    detail: 1,
    shape_preservation: 0.5,
    num_inference_steps: 10,
  }
) {
  const result: UpscaleResult = await fal.run(`fal-ai/creative-upscaler`, {
    input: {
      image_url: image_url,
      ...options,
    },
  });

  //read result.image.url; and return base64 string
  return result.image.url;
}

// This function makes a request to the FAL api and gets an image.
export async function generateVideoFal(image_url: string, steps: number = 2) {
  const result: VideoResult = await fal.run(`fal-ai/fast-svd-lcm`, {
    input: {
      image_url: image_url,
      steps: steps,
      fps: 5,
    },
  });

  //read result.image.url; and return base64 string
  return result.video.url;
}
