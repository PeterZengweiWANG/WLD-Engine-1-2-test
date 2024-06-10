export type Message = {
  content: string;
  role: "user" | "assistant" | "system";
};

export type LLMRequest = {
  response_format?: { type: "json_object" };
  messages: Message[];
  max_tokens: number;
  model: string;
};
