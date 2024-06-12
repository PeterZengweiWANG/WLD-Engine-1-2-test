"use client";
import { getGeminiVision } from "@/ai/gemini";
import { getGroqCompletion } from "@/ai/groq";
import GraphCanvas, {
  Edge,
  GNode,
  Graph,
  relaxGraph,
} from "@/components/Graph";
import { useEffect, useState } from "react";
import crypto from "crypto";
import KeyValueTable from "@/components/KeyValueTable";
import { unstable_noStore as noStore } from "next/cache";
type EditNode = {
  x: number;
  y: number;
  node?: GNode;
  context: GNode[];
};

//Generates a knowledge graph of a given concept and allows for quering it
//The onChange event is fired whenever the graph changes for integration with other components
export default function KnowledgeGraph({
  graph = { nodes: [], edges: [] },
  onUpdate = (graph: Graph) => {},
  onSelect = (node: GNode) => {},
}: {
  graph?: Graph;
  onUpdate?: (graph: Graph) => void;
  onSelect?: (node: GNode) => void;
}) {
  noStore();
  const [nodes, setNodes] = useState<GNode[]>(graph.nodes);
  const [edges, setEdges] = useState<Edge[]>(graph.edges);
  const [concept, setConcept] = useState<string>(
    "The wildfire will likely burn every bit of the land at in Healesville and surrounds in the next 50 years. As a response to this situation, the following solutions are implemented: 1. categories the land in this area into three types, farmland, forests, and urban environment. 2. Inspired by the ancient aboriginal wisdom, a mass scale aboriginal culture/cool burning program covering the entire region is initiated. The central idea of Cool Burns is fire management using a ‘cool’ fire. Night times and early mornings are ideal for these fires as nightly dew helps cool down the fire and the winds are often gentle. The practice involves lighting low fires in small areas on foot, with matches or, traditionally, with fire sticks. These fires are closely monitored, ensuring that only the underbrush ( underbrush ideal for burning: fully grown grasses that are not dried out ) is burnt. Cool Burns not only clear areas of land, they also ensure that seeds and nutrients in the soil are not baked and destroyed. In fact, these fires assist in changing vegetation structures by reducing the density of risk factor plants such as Bracken Fern or Casuarina which lead to extreme fuel loads. In every early dry-season from then on, cool fires will trickle through the landscape and burn only some of the fuel, creating a network, or mosaic, of burnt firebreaks. These stop the late dry-season, hot fires. The Key of this program is for cool burning to be implemented on every type of land with no exception, the sole purpose of the program is to create a mass reliable network of burnt firebreaks across the area to prevent the catastrophic wildfires. 3. In response to the Cool Burn program,  each land type has been reprogrammed with its own unique design strategies to adapt the new conditions as the Cool Burn program is effective across all types of land. 4. The residents in urban area needs to be replanned and relocated regularly using portable and modular housing systems due to the yearly Cool Burn program. For example, in the first year, 5% of total areas of Healesville town will be burned with cold fire in order to create firebreak zone and management the bushfire risk, residents within the area will be temporarily relocated to unburnt areas, in the next year, another 5% of total area of Healesville will be burned, and residents in that area will be relocated to new areas. The strategy will implement modular temporary housing systems: a type of residential building that can be built, disassembled and recycled quickly and designed to be self sustainable for a couple of years to achieve the goals of quickly and regularly relocating large population. 5. Farm lands are also regularly burned in similar patterns as the urban areas, every year the burnt area of farm land will be temporarily repurposed to two uses mainly: one is to grow valuable mushroom species that can thrive in recently burned areas such as morels and pyrophytic fungi, another one is to establish temporary biochar production facilities as burnt vegetation can be converted into biochar, a charcoal-like substance used to improve soil quality, increase soil carbon sequestration, and enhance soil water retention. The goal of this strategy is about maintaining the economical value of farm land even though constant cool burning in selected large areas. 6. The forest area is a crucial part of the Cool Burn program, however due to its complex and fragile ecosystem, scientific and cultural value, a customised design strategy is implemented to ensure a sustainable cycle of cool burn in the forest. The central idea of the strategy is based on the “Fireproof Berm Design”, this is a series of large scale, dendritical spreading berm and bunker structure evenly located in the forest in east of Healesville. This outside berm creates a wildfire-defensible space clearing nearby vegetation, integrates a series of small water reservoirs, contains elevated wildfire observation towers and fast reaction stations, and tourist observation decks for viewing Aboriginal cool burning activities. The inside bunker has Hot Springs, Day Spa and accommodation facilities, and the bottom of the bunker features a wombat cave-inspired cave+ tunnel+ open space style sanctuary that can be used as shelters for local wildlife during wildfires. The overall structure should be like an 2 levels underground architectural infrustructure, like a valley. These structures will be the centra and ignition points of its own specific areas of the forest as they are eventually distributed in the forest. The berm structure works as recreational facility, wildlife shelter, scientific fire management facility and Cool Burn program ignition points at the same time, this makes the “Fireproof Berm Design” the most important part for the program in controlling fire risk in Healesville forests."
  );
  const [generating, setGenerating] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<GNode | null>(null);
  const [editNode, setEditNode] = useState<EditNode | null>(null);
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<any>({});

  //listen for changes to the props
  useEffect(() => {
    if (!graph || !graph.nodes || graph.nodes.length == 0) return;
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [graph]);

  const handleAsk = async () => {
    setAnswer({ answering: "" });
    try {
      const response = await getGroqCompletion(
        `Knowledge Graph: ${JSON.stringify({
          nodes,
          edges,
        })} Query: ${question} `,
        512,
        `The user will provide you with a query for a knowledge graph of entities and relationships.
         Use the graph to make assumptions about a reasonable answer to the query. If necessary, estimate quantities and provide reasoning.
        If the knowledge graph contains the answer to the query, return it. Return your response in JSON in the format {reasoning:string, newData:string, answer:string}`,
        true
      );
      const graphJSON = JSON.parse(response);
      setAnswer(graphJSON);
    } catch (e) {
      console.error(e);
      setAnswer({});
    }
  };
  const handleCreate = async (prompt: string) => {
    setGenerating(true);
    try {
      const graph = await getGeminiVision(
        prompt,
        undefined,
        `
        The user will provide you with a concept to be graphed. 
        Generate an array of Nodes and an array of Edges to represent the knowledge graph.
        Nodes should be in the format {id: string, name: string, x:number, y:number, properties?: any}.
        Properties can be an object with any additional information you want to include about the node.
        Include an image key in the properties object that describes an image prompt for stable diffusion used to illustrate the concept.
        Edges should be in the format {source:string, target:string, relation:string}.
        Return your response in JSON in the format {nodes:Node[], edges: Edge[]}.`,
        true
      );

      const graphJSON = JSON.parse(graph);
      updateGraph(graphJSON.nodes, graphJSON.edges);
    } catch (e) {
      console.error(e);
    }
    setGenerating(false);
  };

  const handleRefine = async () => {
    setGenerating(true);
    try {
      const graph = await getGroqCompletion(
        JSON.stringify({ concept, nodes, edges }),
        1024,
        `The user will provide you with a knowledge graph of entities and relationships.
       Generate an array of new nodes to add to the graph that further connect and explain entities and relationships.
       Add nodes and relationships to nodes that do not have many existing edges. 
       Return your response in JSON in the format {newNodes:Node[], newEdges: Edge[]}.`,
        true
      );
      const graphJSON = JSON.parse(graph);
      updateGraph(
        [...nodes, ...graphJSON.newNodes],
        [...edges, ...graphJSON.newEdges]
      );
    } catch (e) {
      console.error(e);
    }
    setGenerating(false);
  };

  const handleMerge = async () => {
    setGenerating(true);
    try {
      const graph = await getGeminiVision(
        JSON.stringify({ concept, nodes, edges }),
        undefined,
        `The user will provide you with a knowledge graph of entities and relationships as well as a concept for a new knowledge graph.
       Generate an array of new nodes to add to the graph that merge the knew concept with the existing knowledge graph.
       Return your response in JSON in the format {newNodes:Node[], newEdges: Edge[]}.`,
        true
      );
      const graphJSON = JSON.parse(graph);
      updateGraph(
        [...nodes, ...graphJSON.newNodes],
        [...edges, ...graphJSON.newEdges]
      );
    } catch (e) {
      console.error(e);
    }
    setGenerating(false);
  };

  const handleCreateProject = async () => {
    setGenerating(true);
    try {
      const graph = await getGroqCompletion(
        JSON.stringify({ concept, nodes, edges }),
        4096,
        `The user will provide you with an abstract graph of entities and relationships.
        Your task is to assign exact specifications to each node to form a concrete case study proposal from the abstract template.
        Generate a map using the node ID as the key and the implementation specifications as the value.
        Return your response in JSON in the format {[id:string]: any}.`,
        true
      );
      const graphJSON = JSON.parse(graph);
      console.log(graphJSON);
      const newNodes = nodes.map((n) => ({
        ...n,
        ...{ implementation: graphJSON[n.id] ?? "" },
      }));
      setNodes(newNodes);
      onUpdate({ nodes: newNodes, edges });
      //asynchronously try to improve the project logic
      handleImproveProjectLogic(newNodes, edges);
    } catch (e) {
      console.error(e);
      alert(e);
    }
    setGenerating(false);
  };

  const handleImproveProjectLogic = async (nodes: GNode[], edges: Edge[]) => {
    try {
      const graph = await getGeminiVision(
        JSON.stringify({ concept, nodes, edges }),
        undefined,
        `The user will provide you with an implementation of a specific concept in the form of a knowledge graph.
         Consider the relationship between all entities in the graph and their specific implementation. 
         Adjust implementation specifications for greater consistency accross the project. 
         Where specific implementation data is missing or ambiguous, add this to the node.
         Generate a map using the node ID as the key and the updated implementation specifications as the value.
         Return your response in JSON in the format {[id:string]: any}.`,
        true
      );
      const graphJSON = JSON.parse(graph);
      console.log(graphJSON);
      const newNodes = nodes.map((n) => ({
        ...n,
        ...(graphJSON[n.id] ?? {}),
      }));
      setNodes(newNodes);
      onUpdate({ nodes: newNodes, edges });
      alert("Project improved with Gemini");
    } catch (e) {
      console.error(e);
      alert("failed to improve the project with Gemini");
    }
  };

  const updateGraph = (nodes: GNode[], edges: Edge[]) => {
    const relaxedNodes = relaxGraph(nodes, edges);
    console.log(relaxedNodes);
    setNodes(relaxedNodes);
    setEdges(edges);
    onUpdate({ nodes: relaxedNodes, edges });
  };

  const handleSelect = (node: GNode) => {
    console.log(node);
    setSelectedNode(node);
    onSelect(node);
  };

  const handleRightClick = (
    x: number,
    y: number,
    onNode: boolean,
    nodes: GNode[]
  ) => {
    //create a new node at the location of the right click
    console.log(x, y, onNode, nodes);
    const e = { x, y, context: nodes } as EditNode;
    if (onNode) e.node = nodes[0];
    setEditNode(e);
  };

  const handleClose = () => {
    setEditNode(null);
  };
  

  const handleCreateNode = async (node: GNode, context: GNode[]) => {
    //connect to graph
    try {
      const newEdges = await getGroqCompletion(
        JSON.stringify({ concept, node, context: editNode }),
        128,
        `The user will provide you with a concept, node and an array of proximate nodes in a knowledge graph representing some aspect of this concept.
         Generate an array of new edges that relate the node to the context.
         Only generate edges if they are relevant to the context.
         Return your response in JSON in the format {edges: {source:id, target:id, relation:string}[]}.`,
        true
      );
      const graphJSON = JSON.parse(newEdges);
      console.log(node, graphJSON.edges);

      setEdges([...edges, ...graphJSON.edges]);
      setNodes([...nodes, node]);
      onUpdate({
        nodes: [...nodes, node],
        edges: [...edges, ...graphJSON.edges],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const integrateAnswer = async () => {
    setGenerating(true);
    try {
      const graph = await getGroqCompletion(
        `Knowledge Graph: ${JSON.stringify({
          nodes,
          edges,
        })} Additional information: ${JSON.stringify(answer)}`,
        1024,
        `The user will provide you with a knowledge graph of entities and relationships.
        The user has made a query to the graph and identified that there is additional information that should be included.
         Generate a new array of nodes and a new array of edges to append to the graph that maps the new information.
         Where the additional information is ambiguous or does not provide specific implementation details, add these to the new node.
         Where the additional information provides options, select one option and specify exact data.
         Return your response in JSON in the format {newNodes:Node[], newEdges: Edge[]}.`,
        true
      );
      const graphJSON = JSON.parse(graph);

      updateGraph(
        [...nodes, ...graphJSON.newNodes],
        [...edges, ...graphJSON.newEdges]
      );
    } catch (e) {
      console.error(e);
    }
    setGenerating(false);
  };

  const saveGraph = async () => {
    localStorage.setItem("graph", JSON.stringify({ nodes, edges }));
    alert("Graph saved");
  };

  const loadGraph = async () => {
    const graph = localStorage.getItem("graph");
    if (graph) {
      try {
        const graphJSON = JSON.parse(graph);
        setNodes(graphJSON.nodes);
        setEdges(graphJSON.edges);
        alert("Graph loaded");
        onUpdate(graphJSON);
      } catch (e) {
        console.error(e);
        alert(e);
      }
    }
  };

  const handleDelete = (node: GNode) => {
    const newNodes = nodes.filter((n) => n.id !== node.id);
    const newEdges = edges.filter(
      (e) => e.source !== node.id && e.target !== node.id
    );
    setNodes(newNodes);
    setEdges(newEdges);
    setEditNode(null);
  };
  

  return (
    <div className="flex flex-col justify-center items-center w-full h-full gap-4 bg-red-800 bg-opacity-10 rounded-lg p-4 border border-black/25">
      <div className="flex justify-between w-full gap-4 flex-wrap">
        <input
          className="p-2 bg-red-800 bg-opacity-10 rounded-lg border border-black/25 w-full"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
        />
        <button
          className="p-2 bg-red-800 bg-opacity-10 rounded-lg  border border-black/25 hover:shadow"
          onClick={() => handleCreate(concept)}
        >
          {generating ? "Generating..." : "Create New Graph"}
        </button>
        <button
          className="p-2 bg-red-800 bg-opacity-10 rounded-lg  border border-black/25 hover:shadow"
          onClick={() => handleMerge()}
        >
          {generating ? "Generating..." : "Merge Concept"}
        </button>
        <button
          className="p-2 bg-red-800 bg-opacity-10 rounded-lg  border border-black/25 hover:shadow"
          onClick={() => handleRefine()}
        >
          {generating ? "Generating..." : "Add Nodes"}
        </button>
        <button
          className="p-2 bg-red-800 bg-opacity-10 rounded-lg border border-black/25 hover:shadow"
          onClick={() => handleCreateProject()}
        >
          {generating ? "Generating..." : "Create Project"}
        </button>
      </div>
      <div className="flex justify-between w-full gap-4 flex-wrap">
        <button
          className="p-2 bg-red-800 bg-opacity-10 rounded-lg hover:shadow"
          onClick={() => saveGraph()}
        >
          Save Project
        </button>
        <button
          className="p-2 bg-red-800 bg-opacity-10 rounded-lg hover:shadow"
          onClick={() => loadGraph()}
        >
          Load Project
        </button>
      </div>
      {selectedNode && (
        <div className="flex flex-col w-full">
          <span className="font-bold"> {selectedNode.name}</span>
          <KeyValueTable data={selectedNode} />
        </div>
      )}
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        onSelect={handleSelect}
        onRightClick={handleRightClick}
      />
      {editNode && (
        <EditNodeDialog
          editNode={editNode}
          graph={{ nodes, edges }}
          concept={concept}
          onClose={handleClose}
          onCreate={handleCreateNode}
          onDelete={handleDelete}
        />
      )}
      <div className="flex justify-between w-full mb-4 gap-4">
        <input
          className="p-2 bg-red-800 bg-opacity-10 rounded-lg  border border-black/25 w-full"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          className="p-2 bg-red-800 bg-opacity-10 rounded-lg  border border-black/25 hover:shadow"
          onClick={handleAsk}
        >
          Explore More
        </button>
      </div>
      <KeyValueTable data={answer} />
      <button
        className="p-2 bg-red-800 bg-opacity-10 rounded-lg  border border-black/25 hover:shadow"
        onClick={integrateAnswer}
      >
        Add Answer to Project!
      </button>
    </div>
  );
}

function EditNodeDialog({
  editNode,
  graph,
  concept,
  onClose,
  onCreate,
  onDelete,
}: {
  editNode: EditNode;
  graph: { nodes: GNode[]; edges: Edge[] };
  concept: string;
  onClose: () => void;
  onCreate: (node: GNode, context: GNode[]) => void;
  onDelete: (node: GNode) => void;
}) {
  const [name, setName] = useState(editNode.node?.name || "");
  const [properties, setProperties] = useState(editNode.node?.properties || {});
  const [newPropKey, setNewPropKey] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleConfirm = () => {
    //update the node and close the dialog
    if (editNode.node) {
      editNode.node.name = name;
      editNode.node.properties = properties;
    } else {
      //add new node
      const id = crypto.randomBytes(4).toString("hex");
      onCreate(
        { id: id, name, x: editNode.x, y: editNode.y, properties },
        editNode.context
      );
    }
    onClose();
  };

  useEffect(() => {
    if (!editNode.node) {
      predictNode();
    }
  }, [editNode]);

  const predictNode = async () => {
    setGenerating(true);
    try {
      const node = await getGeminiVision(
        JSON.stringify({ concept, context: editNode, nodes: graph }),
        undefined,
        `The user will provide you with a concept and an array of proximate nodes in a graph representing some aspect of this concept.
         Generate a new node that fits into this graph.
         Return your response in JSON in the format {x:number, y:number, name:string, properties:{description:string}}.`,
        true
      );
      const graphJSON = JSON.parse(node);
      if (graphJSON) {
        setName(graphJSON.name);
        setProperties(graphJSON.properties);
      }
    } catch (e) {
      console.error(e);
    }
    setGenerating(false);
  };

  const addProperty = () => {
    if (newPropKey) {
      setProperties({ ...properties, [newPropKey]: "" });
      setNewPropKey("");
    }
  };

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className={`absolute top-0 left-0 w-full h-full bg-black/25 flex flex-col items-center justify-center`}
    >
      <div className="flex flex-col p-4 max-w-lg bg-red-800 bg-opacity-10 rounded-lg shadow-xl gap-4 w-full">
        <span className="text-lg font-bold w-full">
          {editNode.node
            ? "Edit Node"
            : generating
            ? "Generating..."
            : "Create Node"}
        </span>
        <input
          onChange={(e) => setName(e.target.value)}
          className="p-2 bg-red-800 bg-opacity-10 rounded-lg w-full border border-black/10"
          value={name}
        />
        {properties &&
          Object.entries(properties).map(([key, value]) => (
            <div
              key={key}
              className="flex w-full gap-4 items-center justify-between"
            >
              <span>{key}</span>
              <input
                className="p-2 bg-red-800 bg-opacity-10 rounded-lg w-full border border-black/10"
                value={properties[key]}
                onChange={(e) =>
                  setProperties({ ...properties, [key]: e.target.value })
                }
              />
            </div>
          ))}
        <div className="w-full border border-black/50 p-2 flex flex-col rounded-lg gap-2">
          <input
            onChange={(e) => setNewPropKey(e.target.value)}
            className="p-2 bg-red-800 bg-opacity-10 rounded-lg w-full border border-black/10"
            value={newPropKey}
          />
          <button
            className="p-2 bg-red-800 bg-opacity-10 w-full rounded-lg border hover:shadow"
            onClick={addProperty}
          >
            Add This Idea!
          </button>
        </div>

        <div className="flex justify-between items-center gap-2">
          <button className="p-2 bg-red-800 bg-opacity-10 rounded-lg" onClick={onClose}>
            Cancel
          </button>

          <button
            className="p-2 bg-red-800 bg-opacity-10 rounded-lg border w-full hover:shadow"
            onClick={handleConfirm}
          >
            Confirm Changes
          </button>
          {editNode.node && (
            <button
              className=" text-red-500 p-2 bg-red-800 bg-opacity-10 rounded-lg"
              onClick={() => onDelete(editNode.node as GNode)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
