"use client";
import Agents from "@/components/Agents";
import { useState } from "react";
import Narration from "@/components/Narration";
import KnowledgeGraph from "@/components/KnowledgeGraph2";
import { Graph, relaxGraph } from "@/components/Graph";
import { getGroqCompletion } from "@/ai/groq";
import Link from "next/link";

export const dynamic = "force-dynamic";

//This is new - just provide a high level goal and groq will figure out how to make agents
const agentGoal =
  "Healesville and its surrounding areas in Victoria, Australia, are facing an imminent and catastrophic threat from wildfires in the next 50 years due to the rapidly changing climate caused by global warming and other planetary events. The unique geographical conditions of this region, characterized by its dense forests, steep terrain, and proximity to the Great Dividing Range, make it particularly susceptible to the occurrence and rapid spread of devastating fires. The Yarra Valley, which encompasses Healesville, is known for its picturesque landscapes, wineries, and lush forests. However, these very features also contribute to the area's vulnerability to wildfires. The dense vegetation, coupled with the region's hot and dry summers, creates ideal conditions for fires to ignite and spread rapidly. The Black Saturday Bushfires in 2009, which claimed 173 lives and destroyed over 2,000 homes, serve as a grim reminder of the destructive potential of wildfires in this area. Climate change projections indicate that the frequency and intensity of heatwaves and droughts in Victoria will continue to increase, exacerbating the risk of wildfires. A study by the Commonwealth Scientific and Industrial Research Organisation (CSIRO) warns that the number of extreme fire danger days in Victoria could increase by up to 65% by 2020 and 230% by 2050, compared to the 1990s. The environmental consequences of such frequent and intense wildfires in the Healesville area would be disastrous.The region is home to numerous endangered species, such as the Leadbeater's Possum and the Helmeted Honeyeater, which rely on the native forests for their survival. Widespread fires would lead to the destruction of critical habitats, pushing these species closer to extinction. Moreover, the degradation of water catchments in the area, which supply water to Melbourne, would have far-reaching implications for the city's water security. The socio-economic impact of wildfires on Healesville and its surrounding communities would be equally devastating. Tourism, which is a key economic driver for the region, would suffer significantly due to the destruction of natural attractions and infrastructure. The local wine industry, which relies on the area's unique terroir, would also be jeopardized by the recurring fires and the associated smoke taint on grapes. Furthermore, the mental health toll on residents living under the constant threat of wildfires cannot be overstated. Repeated evacuations, property losses, and the trauma of experiencing life-threatening situations can lead to long-term psychological consequences, such as anxiety, depression, and post-traumatic stress disorder (PTSD). Given the severity of the threat posed by wildfires to Healesville and its surroundings, urgent action is necessary to mitigate the impact of climate change and to implement effective fire management strategies.This includes investing in early warning systems, improving evacuation procedures, and promoting fire-resilient building practices. Additionally, efforts must be made to preserve and restore the region's native forests, which play a critical role in regulating the local climate and reducing the intensity of fires. The potential loss of Healesville and its surrounding areas to wildfires in the next 50 years is a stark reminder of the devastating consequences of climate change. It is imperative that all levels of government, in collaboration with local communities and stakeholders, take immediate and decisive action to address this crisis. The future of this iconic region, its unique biodiversity, and the well-being of its residents depend on our collective ability to confront and adapt to the challenges posed by a rapidly changing climate.";
//set your agents here. If you leave this empty then Groq creates some for you based on your graph and the goal above.
const initAgents: any = [];
//Demo of running multiple agents that all compete for resources
export default function AgentsPage() {
  const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
  const [showUI, setShowUI] = useState<boolean>(true);
  const [playNarration, setPlayNarration] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);

  const handleResponse = async (newAgents: any[]) => {
    setGenerating(true);
    //now we have the new agents, we can implement our logic for how to update the graph.
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
          Return your response in JSON in the format {newNodes:Node[], newEdges:Edge[], newStates:{[id:string]: string}}.Only return a single valid JSON object with no other text or explanation.`,
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
      const edges = [...graph.edges, ...graphJSON.newEdges];
      const relaxed = relaxGraph(
        [...updatedNodes, ...graphJSON.newNodes],
        edges
      );
      const newGraph = { nodes: relaxed, edges: edges };

      setGraph(newGraph);
    } catch (e) {
      console.error(e);
      alert("failed to update graph");
    }
    setGenerating(false);
  };

  const getGraph = (graph: Graph) => {
    setGraph(graph);
  };


  return (
    <main className="">
      <div className="z-10 max-w-lg w-full items-center justify-between font-mono text-sm lg:flex">
        <Narration
                  play={playNarration}
                  textToNarrate={JSON.stringify(graph)}
                  captionPrompt={`You are provided with a world state and an array of agents performing tasks to make changes to this world state. 
        Write a short script that narrates a documentary film that dramatizes these events and embellishes them where necessary to make them 
        engaging to the audience. Narrate the documenary as lines of dialogue by a narrator and other characters. Place each item of dialogue on a new line. 
        Each line should be in the format "Speaker: Dialogue". Do not include any other text or explanation.`}
                  imagePrompt={`You are an expert photographer describing images to the blind. You describe a scene provided by the user in vivid detail. 
          Describe the scene as if you were painting a picture with words. Start your description with: "A photograph of" then use keywords and simple phrases separated by commas.
          End your description with: Canon EOS 5D Mark IV, 24mm, f/8, 1/250s, ISO 100, 2019`} events={[]}        />
        <div id="Agent UI" className="flex flex-col p-8 z-50">
          <button
            className="p-2 border rounded-lg bg-white/25 mb-2"
            onClick={() => setShowUI(!showUI)}
          >
            {showUI ? "Hide UI" : "Show UI"}
          </button>

          <Link href="/timeline/startpage" className="p-2 border-2 border-white rounded-lg bg-red-800 bg-opacity-10 text-white mb-2 hover:bg-white hover:text-gray-800 transition duration-200">
              Return
            </Link>

          <div
            className={`${
              showUI ? "flex" : "hidden"
            }  flex-col w-full bg-red-800 bg-opacity-10 p-4 rounded-lg gap-4`}
          >
            <button
              className="p-2 rounded-lg border bg-red-500 bg-opacity-50 shadow"
              onClick={() => setPlayNarration(!playNarration)}
            >
              {playNarration ? "Stop Narrating" : "Start Narrating"}
            </button>
            {generating && <span>Updating Graph...</span>}
            <KnowledgeGraph graph={graph} onUpdate={getGraph} />
            <Agents
              world={graph}
              initAgents={initAgents}
              onUpdate={handleResponse}
              goal={agentGoal}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

