import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateRoomImage(prompt: string) {
  // Replace model/parameters with the latest OpenAI image model available in your account.
  const result = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1536x1024"
  });

  return result.data?.[0];
}

export async function editRoomImage(input: {
  prompt: string;
  imageFiles: File[];
}) {
  // Implement once the browser/server file transfer path is wired.
  // Keep this function as the single abstraction layer for image edits.
  throw new Error("editRoomImage not implemented yet");
}
