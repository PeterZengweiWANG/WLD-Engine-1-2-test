import { useState, useEffect } from "react";
import { getGroqCompletion } from "@/ai/groq";
import { jsonText } from "@/ai/prompts";

export type Event = {
  title: string;
  influence: "Positive" | "Negative" | "Neutral";
  description: string;
};

export default function Chronology({
  graph,
  onEventGenerated,
}: {
  graph: any;
  onEventGenerated: (event: Event) => void;
}) {
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const generateEvent = async () => {
      try {
        const requestString = `${JSON.stringify(graph)}`;
        const eventResponse = await getGroqCompletion(
          requestString,
          512,
          `Based on the provided knowledge graph of the design project, generate an event that could either have a positive, negative, or neutral influence on the project in Healesville.
          Return your response in JSON in the format {title: string, influence: "Positive" | "Negative" | "Neutral", description: string}.
          The event description should be around 70 words.` + jsonText,
          true
        );
        const eventJSON = JSON.parse(eventResponse);
        console.log("Generated event:", eventJSON);
        setEvent(eventJSON);
        onEventGenerated(eventJSON);
      } catch (e) {
        console.error(e);
        alert("Failed to generate event");
      }
    };

    if (graph) {
      generateEvent();
    }
  }, [graph, onEventGenerated]);

  return (
    <div className="flex flex-col w-full rounded-lg border border-black/25 p-4">
      <h2 className="text-lg font-semibold mb-4">Chronology of Events</h2>
      {event ? (
        <div>
          <p className="font-semibold">Event Title: {event.title}</p>
          <p>Event Influence: {event.influence}</p>
          <p>Event Description: {event.description}</p>
        </div>
      ) : (
        <p>No event generated yet.</p>
      )}
    </div>
  );
}