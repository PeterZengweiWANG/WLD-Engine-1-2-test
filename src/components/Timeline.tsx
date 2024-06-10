export type TimelineEvent = {
  time: number;
  title: string;
  data: any;
};

//Component for displaying events on a timeline
export default function Timeline({
  events,
  onSelect,
}: {
  events: TimelineEvent[];
  onSelect: (event: TimelineEvent) => void;
}) {
  if (events.length === 0) return null;

  // Find the minimum and maximum time values
  const minTime = Math.min(...events.map((event) => event.time));
  const maxTime = Math.max(...events.map((event) => event.time));

  return (
    <div className="relative w-full h-0 border border-black my-4">
      {events
        .sort((a, b) => a.time - b.time)
        .map((timelineEvent, index) => (
          <div
            key={index}
            onClick={() => onSelect(timelineEvent)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer p-2 bg-white rounded border border-black"
            style={{
              left: `${
                ((timelineEvent.time - minTime) / (maxTime - minTime)) * 100
              }%`,
              top: "-50%",
            }}
          >
            {timelineEvent.title}
          </div>
        ))}
    </div>
  );
}
