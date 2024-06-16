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
  const [events, setEvents] = useState<Event[]>([]);

  const generateEvent = async () => {
    try {
      const requestString = `${JSON.stringify(graph)}`;
      const eventResponse = await getGroqCompletion(
        requestString,
        512,
        `Based on the provided knowledge graph of the design project, generate an event that could either have a negative, positive, or neutral influence on the project in Healesville.
        Return your response in JSON in the format {title: string, influence: "Negative" | "Positive"| "Neutral", description: string}.
        The event description should be around 70 words.` + jsonText,
        true
      );
      const eventJSON = JSON.parse(eventResponse);
      console.log("Generated event:", eventJSON);
      setEvents((prevEvents) => [...prevEvents, eventJSON]);
      onEventGenerated(eventJSON);
    } catch (e) {
      console.error(e);
      alert("Failed to generate event");
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      generateEvent();
    }, Math.random() * 90000 + 30000); // Random interval between 90 and 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [graph]);

  return (
    <div className="flex flex-col w-full rounded-lg border-2 border-white p-4 bg-red-800 bg-opacity-10">
      <h2 className="text-lg font-semibold mb-4 text-white">Chronology of Events</h2>
      {events.length > 0 ? (
        events.map((event, index) => (
          <div key={index} className="text-white">
            <p className="font-semibold">Event Title: {event.title}</p>
            <p>Event Influence: {event.influence}</p>
            <p>Event Description: {event.description}</p>
          </div>
        ))
      ) : (
        <p className="text-white">No event generated yet.</p>
      )}
    </div>
  );
}