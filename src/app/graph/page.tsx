"use client";
import { Edge, GNode } from "@/components/Graph";
import { useState } from "react";
import KnowledgeGraph from "@/components/KnowledgeGraph";

export default function Page() {
  const [showUI, setShowUI] = useState<boolean>(true);

  const handleUpdate = (graph: { nodes: GNode[]; edges: Edge[] }) => {
    //do something whenever the graph changes
  };

  return (
    <main className="flex min-h-screen flex-col items-start justify-between p-8">
      <div className="z-10 max-w-2xl w-full font-mono text-sm lg:flex flex-col">
        <div id="Graph UI" className="flex flex-col z-50">
          <button
            className="p-2 border rounded-lg bg-white/25 mb-2"
            onClick={() => setShowUI(!showUI)}
          >
            {showUI ? "Hide UI" : "Show UI"}
          </button>
        </div>
        <div className={`${showUI ? "flex" : "hidden"} flex flex-col`}>
          <KnowledgeGraph />
        </div>
      </div>
    </main>
  );
}
