import { Message } from "@/ai/types";

//Component for viewing chat history
export default function ChatHistory({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((message, i) => (
        <div
          key={i}
          className={`p-4 rounded-lg ${
            message.role === "user"
              ? "bg-blue-200 text-blue-800"
              : "bg-green-200 text-green-800"
          }`}
        >
          {message.content}
        </div>
      ))}
    </div>
  );
}
