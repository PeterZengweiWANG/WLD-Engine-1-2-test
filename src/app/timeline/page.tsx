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
  "The wildfire will likely burn every bit of the land at in Healesville and surrounds in the next 50 years. As a response to this situation, the following solutions are implemented: 1. categories the land in this area into three types, farmland, forests, and urban environment. 2. Inspired by the ancient aboriginal wisdom, a mass scale aboriginal culture/cool burning program covering the entire region is initiated. The central idea of Cool Burns is fire management using a ‘cool’ fire. Night times and early mornings are ideal for these fires as nightly dew helps cool down the fire and the winds are often gentle. The practice involves lighting low fires in small areas on foot, with matches or, traditionally, with fire sticks. These fires are closely monitored, ensuring that only the underbrush ( underbrush ideal for burning: fully grown grasses that are not dried out ) is burnt. Cool Burns not only clear areas of land, they also ensure that seeds and nutrients in the soil are not baked and destroyed. In fact, these fires assist in changing vegetation structures by reducing the density of risk factor plants such as Bracken Fern or Casuarina which lead to extreme fuel loads. In every early dry-season from then on, cool fires will trickle through the landscape and burn only some of the fuel, creating a network, or mosaic, of burnt firebreaks. These stop the late dry-season, hot fires. The Key of this program is for cool burning to be implemented on every type of land with no exception, the sole purpose of the program is to create a mass reliable network of burnt firebreaks across the area to prevent the catastrophic wildfires. 3. In response to the Cool Burn program,  each land type has been reprogrammed with its own unique design strategies to adapt the new conditions as the Cool Burn program is effective across all types of land. 4. The residents in urban area needs to be replanned and relocated regularly using portable and modular housing systems due to the yearly Cool Burn program. For example, in the first year, 5% of total areas of Healesville town will be burned with cold fire in order to create firebreak zone and management the bushfire risk, residents within the area will be temporarily relocated to unburnt areas, in the next year, another 5% of total area of Healesville will be burned, and residents in that area will be relocated to new areas. The strategy will implement modular temporary housing systems: a type of residential building that can be built, disassembled and recycled quickly and designed to be self sustainable for a couple of years to achieve the goals of quickly and regularly relocating large population. 5. Farm lands are also regularly burned in similar patterns as the urban areas, every year the burnt area of farm land will be temporarily repurposed to two uses mainly: one is to grow valuable mushroom species that can thrive in recently burned areas such as morels and pyrophytic fungi, another one is to establish temporary biochar production facilities as burnt vegetation can be converted into biochar, a charcoal-like substance used to improve soil quality, increase soil carbon sequestration, and enhance soil water retention. The goal of this strategy is about maintaining the economical value of farm land even though constant cool burning in selected large areas. 6. The forest area is a crucial part of the Cool Burn program, however due to its complex and fragile ecosystem, scientific and cultural value, a customised design strategy is implemented to ensure a sustainable cycle of cool burn in the forest. The central idea of the strategy is based on the “Fireproof Berm Design”, this is a series of large scale, dendritical spreading berm and bunker structure evenly located in the forest in east of Healesville. This outside berm creates a wildfire-defensible space clearing nearby vegetation, integrates a series of small water reservoirs, contains elevated wildfire observation towers and fast reaction stations, and tourist observation decks for viewing Aboriginal cool burning activities. The inside bunker has Hot Springs, Day Spa and accommodation facilities, and the bottom of the bunker features a wombat cave-inspired cave+ tunnel+ open space style sanctuary that can be used as shelters for local wildlife during wildfires. The overall structure should be like an 2 levels underground architectural infrustructure, like a valley. These structures will be the centra and ignition points of its own specific areas of the forest as they are eventually distributed in the forest. The berm structure works as recreational facility, wildlife shelter, scientific fire management facility and Cool Burn program ignition points at the same time, this makes the “Fireproof Berm Design” the most important part for the program in controlling fire risk in Healesville forests.";
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
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

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
        const eventNode: GNode = {
          id: crypto.randomBytes(4).toString("hex"),
          name: currentEvent.title,
          x: Math.random() * 100,
          y: Math.random() * 100,
          properties: {
            influence: currentEvent.influence,
            description: currentEvent.description,
          },
        };
        updatedNodes.push(eventNode);
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
          captionPrompt={`You are provided with a world state and an array of agents performing tasks to make changes to this world state. 
          Write a long script that narrates a reporter live streaming records collaboration about the whole story including the start, the development processes, and the end of an urban+landscape+architectural design project for Healesville, Victoria, that dramatizes these processes and embellishes them where necessary to make them engaging to the audience. The script of design project record would be both full of opportunities and challenges due to the Unexpected Consequence Events contained in the world state.
          Narrate the design project record as lines of dialogue by a narrator and other characters. Place each item of dialogue on a new line. 
          Each line should be in the format "Speaker: Dialogue". Do not include any other text or explanation.`}
          imagePrompt={`You are a melbourne borned god-tier tv channel live streaming cameraman
          who can travel to the near future with your professional camera and famous for only taking photos in Australia. You travelled across the timelines 2024 to 2050 capturing and documenting the development processes of an urban planning+ landscape arhictecture project and related scenes in Healesville, Victoria, Australia. Now describing the images you recorded to the blind. You describe an scene in Healesville provided by the user in vivid and attractive detail. 
          Describe the scene as if you were painting a picture with words. Start your description with: "A Boldly-composed award-winning photograph of" then use keywords and simple phrases separated by commas.
          End your description with: Canon EOS-1D X Mark III 24mm f/8 1/250s ISO 200 2021`}
        />
        <div id="Agent UI" className="flex flex-col p-8 z-50">
          <button
            className="p-2 border rounded-lg bg-white/25 mb-2"
            onClick={() => setShowUI(!showUI)}
          >
            {showUI ? "Hide UI" : "Show UI"}
          </button>
          <div
            className={`${
              showUI ? "flex" : "hidden"
            }  flex-col w-full bg-white p-4 rounded-lg gap-4`}
          >
            <button
              className="p-2 rounded-lg border bg-white shadow"
              onClick={() => setPlayNarration(!playNarration)}
            >
              {playNarration ? "Stop Narrating" : "Start Narrating"}
            </button>
            {generating && <span>Updating Graph...</span>}
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