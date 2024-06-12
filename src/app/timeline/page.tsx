"use client";
import Agents from "@/components/Agents";
import { useState } from "react";
import Narration from "@/components/Narration";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import { GNode, Graph, relaxGraph } from "@/components/Graph";
import { getGroqCompletion } from "@/ai/groq";
import Timeline, { TimelineEvent } from "@/components/Timeline";
import { jsonText } from "@/ai/prompts";
import { unstable_noStore as noStore } from "next/cache";
import { generateImageFal } from "@/ai/fal";
import Panorama from "@/components/Panorama";
import Chronology, { Event } from "@/components/Chronology";
import crypto from "crypto";

//This is new - just provide a high level goal and groq will figure out how to make agents
const agentGoal =
  "Design and keep developing a urban+ landscape+ architectural project for Healesville Victoria to deal with the increasing wildfire threats and seek chance of turning wildfire into a beneficial factor for development by 2050";
//set your agents here. If you leave this empty then Groq creates some for you based on your graph and the goal above.
const initAgents: any = [];
//if this is true agents add nodes to the graph as well as update implementation data. Its slower.
const addNodes = true;
//start year
const startYear = 2024;

//Demo of running multiple agents that all compete for resources
export default function AgentsPage() {
  noStore();
  const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
  const [showUI, setShowUI] = useState<boolean>(true);
  const [playNarration, setPlayNarration] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [currentYear, setCurrentYear] = useState<number>(startYear);
  const [fetching, setFetching] = useState<boolean>(false);
  const [img, setImg] = useState<string>("");
  const [currentEvent, setCurrentEvent] = useState<Event[]>([]);

  const handleResponse = async (newAgents: any[]) => {
    setGenerating(true);
    //now we have the new agents we can implement our logic for how to update the graph.
    try {
      const requestString = `${JSON.stringify({ graph, newAgents })}`;
      console.log(requestString);
      //just refine implementation
      const newStates = await getGroqCompletion(
        requestString,
        1024,
        `The user will provide you with an implementation of a specific concept in the form of a knowledge graph together with an array of agents working towards specific goals within this graph.
          Your task is to update the knowledge graph to reflect the changes made by the agents.
          Generate an array of new Nodes and an array of new Edges to represent any concepts not already modelled by the knowledge graph.
          Update any existing nodes affected by the agents using a state map. Generate a new state object for each affected node using the node ID as the key and the new state as the value.
          Return your response in JSON in the format {newNodes:Node[] newEdges:Edge[] newStates:{[id:string]: string}}.` +
          jsonText,
        true,
        "llama3-8b-8192"
      );
      const graphJSON = JSON.parse(newStates);
      console.log(graphJSON);
      //iterate over state updates
      const updatedNodes = [...graph.nodes];
      for (const [id, state] of Object.entries(graphJSON.newStates)) {
        const node: any = updatedNodes.find((n) => n.id === id);
        if (node) node.state = state;
      }

      // Introduce the current event into the Graph JSON
      if (currentEvent) {
        currentEvent.forEach((event) => {
          const eventNode: GNode = {
            id: crypto.randomBytes(4).toString("hex"),
            name: event.title,
            x: Math.random() * 100,
            y: Math.random() * 100,
            properties: {
              influence: event.influence,
              description: event.description,
            },
          };
          updatedNodes.push(eventNode);
        });
      }

      const edges = [...graph.edges, ...graphJSON.newEdges];
      const relaxed = relaxGraph(
        [...updatedNodes, ...graphJSON.newNodes],
        edges
      );
      const newGraph = { nodes: relaxed, edges: edges };

      setGraph(newGraph);
      setCurrentYear((c) => c + 5);
      //add to timeline
      timelineEvents.push({
        time: currentYear,
        title: currentYear.toString(),
        data: newGraph,
      });
    } catch (e) {
      console.error(e);
      alert("failed to update graph");
    }
    setGenerating(false);
  };

  const getGraph = (graph: Graph) => {
    setGraph(graph);
    setCurrentYear((c) => c + 2);
    timelineEvents.push({
      time: currentYear,
      title: currentYear.toString(),
      data: graph,
    });
  };

  const handleTimelineSelect = (event: TimelineEvent) => {
    setGraph(event.data);
  };

  const handleNodeSelect = async (node: GNode) => {
    setFetching(true);
    //improve prompt
    const newPrompt =
      "An equirectangular panorama of" + node.name + node.properties.image ??
      "" + ". Canon EOS 5D Mark IV 24mm f/8 1/250s ISO 100";
    //if immersive use blockade otherwise just use fal
    const pano = await generateImageFal(newPrompt);
    if (pano) setImg(pano);
    setFetching(false);
  };

  return (
    <main className="">
      <div className="z-10 max-w-lg w-full items-center justify-between font-mono text-sm lg:flex">
        {img && !playNarration && (
          <div className="fixed top-0 left-0 w-screen h-screen min-h-screen">
            <Panorama img={img} immersive={false} />
          </div>
        )}
        <Narration
          play={playNarration}
          textToNarrate={JSON.stringify(graph)}
          captionPrompt={`You are provided with a world state and an array of agents performing tasks to make changes to this world state, as well as a list of events that occur during the project timeline.
            Write a short script that narrates a documentary film of the starting and the continuing development processes of an urban+landscape+architectural design project for Healesville, Victoria that dramatizes these events and embellishes them where necessary to make them
            engaging to the audience. Narrate the documentary as lines of dialogue by a narrator and other characters. Place each item of dialogue on a new line.
            Each line should be in the format "Speaker: Dialogue". Do not include any other text or explanation.`}
          imagePrompt={`You are an expert photographer describing images to the blind. Images are taken in Healesville, Victoria. You describe a scene provided by the user in vivid detail.
            Describe the scene as if you were painting a picture with words. Start your description with: "A photograph of" then use keywords and simple phrases separated by commas.
            End your description with: Canon EOS 5D Mark IV 24mm f/8 1/250s ISO 100 2019`}
          events={currentEvent} // Pass the list of events
        />
        <div id="Agent UI" className="flex flex-col p-8 z-50">
          <button
            className="p-2 border-2 border-yellow-500 rounded-lg bg-gray-800 text-yellow-500 mb-2 hover:bg-yellow-500 hover:text-gray-800 transition duration-200"
            onClick={() => setShowUI(!showUI)}
          >
            {showUI ? "Hide UI" : "Show UI"}
          </button>
          <div
            className={`${
              showUI ? "flex" : "hidden"
            }  flex-col w-full bg-gray-800 p-4 rounded-lg gap-4 border-2 border-yellow-500`}
          >
            <button
              className="p-2 rounded-lg border-2 border-yellow-500 bg-gray-800 text-yellow-500 shadow hover:bg-yellow-500 hover:text-gray-800 transition duration-200"
              onClick={() => setPlayNarration(!playNarration)}
            >
              {playNarration ? "Stop Narrating" : "Start Narrating"}
            </button>
            {generating && <span className="text-yellow-500">Updating Graph...</span>}
            <Timeline events={timelineEvents} onSelect={handleTimelineSelect} />
            <KnowledgeGraph
              graph={graph}
              onUpdate={getGraph}
              onSelect={handleNodeSelect}
            />
            <Agents
              world={graph}
              initAgents={initAgents}
              onUpdate={handleResponse}
              goal={agentGoal}
              time={currentYear.toString()}
            />
            <Chronology graph={graph} onEventGenerated={setCurrentEvent} />
          </div>
        </div>
      </div>
    </main>
  );
}