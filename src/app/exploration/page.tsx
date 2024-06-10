"use client";

import { getMap, saveConnections, saveMapCoordinates } from "./supabaseMaps";
import { useEffect, useState } from "react";
import { getGroqCompletionParallel } from "@/ai/groq";
import GraphCanvas, { Edge, GNode } from "@/components/Graph";

export default function ExplorationPage() {
  const [selectedNode, setSelectedNode] = useState<GNode | null>(null);
  const [nodes, setNodes] = useState<GNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const scale = 100;

  useEffect(() => {
    //use the last created location as a starting coordinate

    const createMap = async () => {
      const { map, connections } = await getMap();
      if (!connections || !map) return;
      setSelectedNode(map[0]);
      setNodes(map);
      setEdges(connections);
    };

    createMap();
  }, []);

  const handleVisitLocation = async (location: GNode) => {
    console.log(location);
    //get all connections for this location
    const connections = edges.filter((e) => e.source === location.id);
    if (connections.length <= 1) {
      //generate some new locations and connections
      const generatedLocations = await connectNewMapLocations(location);
      //save to database
      const newNodes = await saveMapCoordinates(generatedLocations);
      if (!newNodes) return;
      const newEdges = newNodes.map((n: GNode) => ({
        source: location.id,
        target: n.id,
      }));
      await saveConnections(newEdges);

      //If no connections then we are on the edge of the graph. Create some new ones.
      setNodes([...nodes, ...newNodes]);
      setEdges([...edges, ...newEdges]);
    }

    //update current location
    setSelectedNode(location);
  };

  const connectNewMapLocations = async (location: GNode) => {
    //generate some new features near this location
    //create some random heading vectors in [x,y,z] format
    const headings = Array.from({ length: 3 }, randomHeading);
    const { id, ...locationDesc } = location;
    const coordinatesString = await getGroqCompletionParallel(
      headings.map(
        (h) =>
          `Current location: ${JSON.stringify(locationDesc)}. New heading: ${h}`
      ),
      128,
      headings.map((h) => newLocationPrompt),
      true
    );
    const coordinates = coordinatesString.map((c) => JSON.parse(c));
    return coordinates;
  };

  const randomHeading = () => {
    return `${Math.random() * scale},${Math.random() * scale},${
      Math.random() * scale
    }`;
  };

  const handleEmptyClick = (
    x: number,
    y: number,
    onNode: boolean,
    nodes: GNode[]
  ) => {
    console.log(x, y, onNode, nodes);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col">
          <span className="text-xl">{selectedNode?.name}</span>
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            onSelect={handleVisitLocation}
            onRightClick={handleEmptyClick}
          />
        </div>
      </div>
    </main>
  );
}

const newLocationPrompt = `You describe new map locations as a player adventures from a current location in a given direction. 
Return the new map location as a valid JSON object in the format {name:string, x:int, y:int, z:int}. Only return the JSON object with no other text or explanation.`;
