"use client";
import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import axios from "axios";
import { useParams } from "next/navigation";
import { toast } from "@/components/ui/toast";
import "./whiteboard.css";
import { ArrowRight, Circle, Diamond, Eraser, Hand, Image, Minus, MousePointer2, Pencil, Square, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const tools = [
  {
    name: "hand",
    icon: Hand,
    color: "text-cyan-500",
  },
  {
    name: "selection",
    icon: MousePointer2,
    color: "text-blue-500",
  },
  {
    name: "rectangle",
    icon: Square,
    color: "text-blue-500",
  },
  {
    name: "diamond",
    icon: Diamond,
    color: "text-emerald-500",
  },
  {
    name: "ellipse",
    icon: Circle,
    color: "text-amber-500",
  },
  {
    name: "arrow",
    icon: ArrowRight,
    color: "text-violet-500",
  },
  {
    name: "line",
    icon: Minus,
    color: "text-pink-500",
  },
  {
    name: "freedraw",
    icon: Pencil,
    color: "text-orange-500",
  },
  {
    name: "text",
    icon: Type,
    color: "text-indigo-500",
  },
  {
    name: "image",
    icon: Image,
    color: "text-green-500",
  },
  {
    name: "eraser",
    icon: Eraser,
    color: "text-red-500",
  },
];

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  },
);

const Whiteboard = () => {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const saveTimeRef = useRef<any>(null);
  const { projectId } = useParams();
  const [activeTool, setActiveTool] = useState<any>();

  const handleCanvasChange = (
    elements: readonly any[],
    appState: any,
    files: any,
  ) => {
    // Cancel Previous Timer
    if (saveTimeRef?.current) {
      clearTimeout(saveTimeRef.current);
    }

    // Start New 10 seconds timer
    saveTimeRef.current = setTimeout(async () => {
      try {
        await SaveCanvasChange(elements, appState, files);
        toast.add({
          type: "success",
          title: "Changes Saved!",
        });
      } catch (error) {
        console.error("Error saving canvas:", error);
      }
    }, 10000);
  };

  const changeTool = (tool: any) => {
    if (!excalidrawAPI) return;

    setActiveTool(tool);
    excalidrawAPI.setActiveTool({
      type: tool,
    });
  };

  // const SaveCanvasChange = async (
  //   elements: readonly any[],
  //   appState: any,
  //   files: any,
  // ) => {
  //   return await axios.post("/api/whiteboard", {
  //     elements: elements,
  //     appState: appState,
  //     files: files,
  //     projectId: projectId,
  //   });
  // };

  return (
    <div>
      <div style={{ height: "90vh" }}>
        <Excalidraw
          onChange={handleCanvasChange}
          //@ts-ignore
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
        />
        <div className="absolute left-4 top-1/2 z-50 -translate-y-1/2 flex flex-col gap-1 rounded-2xl bg-white border p-1.5 shadow-xl">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.name}
                onClick={() => {
                  setActiveTool(tool.name);
                  changeTool(tool.name);
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-primary/10 hover:cursor-pointer ${
                  activeTool == tool.name ? "bg-primary/10 text-primary" : ""
                }`}
              >
                <Icon size={19} className={tool.color} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
