"use client";
import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import axios from "axios";
import { useParams } from "next/navigation";
import { toast } from "@/components/ui/toast";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  }
);

const Whiteboard = () => {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const saveTimeRef = useRef<any>(null);
  const { projectId } = useParams();

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

  const SaveCanvasChange = async (
    elements: readonly any[],
    appState: any,
    files: any,
  ) => {
    return await axios.post("/api/whiteboard", {
      elements: elements,
      appState: appState,
      files: files,
      projectId: projectId,
    });
  };

  return (
    <div>
      <div style={{ height: "90vh" }}>
        <Excalidraw
          onChange={handleCanvasChange}
          //@ts-ignore
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
        />
      </div>
    </div>
  );
};

export default Whiteboard;

