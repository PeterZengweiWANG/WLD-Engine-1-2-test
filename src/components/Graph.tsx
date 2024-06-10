"use client";
import { useEffect, useMemo, useRef, useState } from "react";

export type GNode = {
  id: string;
  name: string;
  x: number;
  y: number;
  z?: number;
  properties?: any;
};

export type Edge = {
  source: string;
  target: string;
  relation?: string;
};

export type Graph = {
  nodes: GNode[];
  edges: Edge[];
};

export default function GraphCanvas({
  nodes,
  edges,
  onSelect,
  onRightClick,
}: {
  nodes: GNode[];
  edges: Edge[];
  onSelect: (node: GNode) => void;
  onRightClick?: (
    x: number,
    y: number,
    onNode: boolean,
    nearest: GNode[]
  ) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [mouseClick, setMouseClick] = useState<{
    button: number;
    x: number;
    y: number;
  } | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapScale = 4;

  const lookup = useMemo(() => {
    const lookup: { [id: string]: GNode } = {};
    nodes.forEach((node) => {
      lookup[node.id] = node;
    });
    return lookup;
  }, [nodes]);

  const drawMap = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx) {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply zoom and pan transformations
      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(scale, scale);

      // Draw your content here
      drawFeatures();

      ctx.restore();
    }
  };

  const drawFeatures = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      //draw all features
      nodes.forEach((feature) => {
        const x = feature.x;
        const y = feature.y;
        ctx.textAlign = "center";

        const connections = edges.filter((e) => e.source === feature.id);
        connections?.forEach((c) => {
          //draw a line to the connection
          const connection = lookup[c.target];
          if (!connection) return;
          ctx.beginPath();
          ctx.moveTo(x * mapScale, y * mapScale + 2);
          ctx.lineTo(connection.x * mapScale, connection.y * mapScale + 2);
          //scale strokewidth
          ctx.lineWidth = 1 / scale;
          //set stroke colour
          ctx.strokeStyle = "rgb(220 220 220)";
          ctx.stroke();
          ctx.closePath();
          if (c.relation) {
            ctx.font = `${10 / scale}px Arial`;
            ctx.fillStyle = "gray";
            ctx.fillText(
              c.relation,
              ((x + connection.x) / 2) * mapScale,
              ((y + connection.y) / 2) * mapScale - 2 / scale
            );
          }
        });
        const fontSize = 12 / scale;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = "blue";

        ctx.fillText(feature.name, x * mapScale, y * mapScale - 8 / scale);
        ctx.beginPath();
        // Define the circle
        ctx.arc(x * mapScale, y * mapScale + 2, 5 / scale, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    const handleClick = (button: number, mouseX: number, mouseY: number) => {
      if (!mouseClick) return;
      setMouseClick(null);
      const canvas = canvasRef.current;
      if (canvas) {
        //get distance to all features and sort
        const sortedNodes = nodes
          .map((node) => {
            const x = node.x;
            const y = node.y;
            const distance = Math.sqrt(
              (x * mapScale - mouseX) ** 2 + (y * mapScale - mouseY) ** 2
            );
            return { d: distance, n: node };
          })
          .sort((a, b) => a.d - b.d);
        const closest = sortedNodes[0];
        if (button === 2) {
          const nearest = sortedNodes.slice(0, 3);
          onRightClick?.(
            Math.floor(mouseX / mapScale),
            Math.floor(mouseY / mapScale),
            closest.d < 20 / scale,
            nearest.map((d) => d.n)
          );
        } else {
          if (closest.d < 20 / scale) onSelect(closest.n);
        }
      }
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      const mouseX = event.clientX - canvas!.getBoundingClientRect().left;
      const mouseY = event.clientY - canvas!.getBoundingClientRect().top;
      const newScale = scale * delta;
      const newOffset = {
        x: offset.x + (mouseX - offset.x) * (1 - delta),
        y: offset.y + (mouseY - offset.y) * (1 - delta),
      };
      setScale(newScale);
      setOffset(newOffset);
    };

    const handleMouseDown = (event: MouseEvent) => {
      //check if right click
      event.preventDefault();
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setMouseClick({
          button: event.button,
          x: (event.clientX - rect.left - offset.x) / scale,
          y: (event.clientY - rect.top - offset.y) / scale,
        });
      }
      setIsDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
    };

    const handleMouseMove = (event: MouseEvent) => {
      setMouseClick(null);
      if (isDragging) {
        const newOffset = {
          x: offset.x + (event.clientX - dragStart.x),
          y: offset.y + (event.clientY - dragStart.y),
        };
        setOffset(newOffset);
        setDragStart({ x: event.clientX, y: event.clientY });
      }
    };

    const handleMouseUp = () => {
      if (mouseClick) {
        console.log("handling click");
        handleClick(mouseClick.button, mouseClick.x, mouseClick.y);
      }
      setIsDragging(false);
    };

    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mouseleave", handleMouseUp);
      canvas.oncontextmenu = (e) => {
        e.preventDefault();
      };
      drawMap();
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseleave", handleMouseUp);
      }
    };
  }, [
    scale,
    offset,
    mapScale,
    isDragging,
    dragStart,
    mouseClick,
    nodes,
    edges,
  ]);

  return (
    <div className="relative flex flex-col items-center justify-center rounded-lg border border-black overflow-hidden">
      <h1>Graph</h1>
      <canvas ref={canvasRef} width={640} height={640} />
    </div>
  );
}

type DynamicNode = GNode & {
  vx: number;
  vy: number;
};
function distance(node1: GNode, node2: GNode) {
  const dx = node1.x - node2.x;
  const dy = node1.y - node2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function applyRepulsiveForce(
  node: DynamicNode,
  otherNode: DynamicNode,
  repulsiveForce: number
) {
  const dist = Math.max(distance(node, otherNode), 1);
  const force = repulsiveForce / (dist * dist);
  node.vx += (node.x - otherNode.x) * force;
  node.vy += (node.y - otherNode.y) * force;
}

function applyAttractiveForce(
  edge: Edge,
  lookup: { [id: string]: DynamicNode },
  attractiveForce: number
) {
  const source = lookup[edge.source];
  const target = lookup[edge.target];
  if (!source || !target) return;
  const dist = Math.max(distance(source, target), 1);
  const force = attractiveForce * (dist - 1); // Assuming desired distance is 1
  const angle = Math.atan2(target.y - source.y, target.x - source.x);
  if (!angle) console.log(angle);
  source.vx += Math.cos(angle) * force;
  source.vy += Math.sin(angle) * force;
  target.vx -= Math.cos(angle) * force;
  target.vy -= Math.sin(angle) * force;
}

export function relaxGraph(
  nodes: GNode[],
  edges: Edge[],
  repulsiveForce = 100,
  attractiveForce = 0.1,
  damping = 0.85,
  iterations = 10
) {
  //create lookup table and format
  const lookup: { [id: string]: DynamicNode } = {};
  const dynamicNodes = nodes.map((node) => {
    const dNode = {
      ...node,
      x: (node.x ?? 0) + (Math.random() - 0.5) * 10,
      y: (node.y ?? 0) + (Math.random() - 0.5) * 10,
      vx: 0,
      vy: 0,
    };
    lookup[node.id] = dNode;
    return dNode;
  });

  for (let i = 0; i < iterations; i++) {
    // Apply repulsive forces
    dynamicNodes.forEach((node) => {
      dynamicNodes.forEach((otherNode) => {
        if (node !== otherNode) {
          applyRepulsiveForce(node, otherNode, repulsiveForce);
        }
      });
    });
    // Apply attractive forces
    edges.forEach((edge) => {
      applyAttractiveForce(edge, lookup, attractiveForce);
    });

    // Update positions and apply damping
    dynamicNodes.forEach((node) => {
      node.x += node.vx ?? 0;
      node.y += node.vy ?? 0;
      node.vx *= damping;
      node.vy *= damping;
    });
  }

  return dynamicNodes.map((node) => {
    const { vx, vy, ...rest } = node;
    rest.x = Math.round(rest.x);
    rest.y = Math.round(rest.y);
    return rest as GNode;
  });
}
