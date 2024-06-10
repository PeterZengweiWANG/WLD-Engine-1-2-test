import { getGroqChat } from "@/ai/groq";
import { Message } from "@/ai/types";
import { useState } from "react";

//Component for sending chat messages and storing the history
//With a callback function that returns the message history whenever a message is received or sent
export default function Chat({
  maxTokens = 256,
  systemPrompt = "",
  onSend,
  onReceive,
}: {
  maxTokens: number;
  systemPrompt: string;
  onSend: (message: Message) => void;
  onReceive: (messages: Message[]) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: systemPrompt },
  ]);
  const [prompt, setPrompt] = useState<string>("");

  const handleSend = async () => {
    const userMessage = { role: "user", content: prompt } as Message;
    onSend(userMessage); //run callback function
    const chatMessages = [...messages, userMessage]; //create messages array
    const response = await getGroqChat(maxTokens, chatMessages); //get chat completion
    const assistantMessage = {
      role: "assistant",
      content: response,
    } as Message;
    chatMessages.push(assistantMessage); //update messages array
    onReceive(chatMessages); //run callback function with new messages
    setMessages(chatMessages); //update state
  };

  return (
    <div className="flex items-center">
      <input
        className="p-2 rounded-lg w-full"
        type="text"
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="What do you want to do?"
      />
      <button className="p-4" onClick={handleSend}>
        Send
      </button>
    </div>
  );
}
