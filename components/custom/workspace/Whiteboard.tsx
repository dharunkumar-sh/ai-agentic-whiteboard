"use client";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import axios from "axios";
import { useParams } from "next/navigation";
import { toast } from "@/components/ui/toast";
import "./whiteboard.css";
import {
  ArrowRight,
  Circle,
  Diamond,
  Eraser,
  Hand,
  Image,
  Minus,
  MousePointer2,
  Pencil,
  Square,
  Type,
} from "lucide-react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import FloatingProperties from "./FloatingProperties";

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

type Props = {
  onAPIReady: (api: ExcalidrawImperativeAPI) => void;
};

const Whiteboard = ({ onAPIReady }: Props) => {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const saveTimeRef = useRef<any>(null);
  const { projectId } = useParams();
  const [activeTool, setActiveTool] = useState<any>();
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [canvasState, setCanvasState] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved",
  );
  const isLoadedRef = useRef<boolean>(false);
  const lastSavedElementsRef = useRef<string>("");
  const pendingDataRef = useRef<{ elements: any[]; appState: any; files: any } | null>(
    null,
  );

  // Sanitize appState for DB serialization (stripping Map objects & transient interaction state)
  const sanitizeAppStateForSave = (rawAppState: any) => {
    if (!rawAppState || typeof rawAppState !== "object") return {};
    const {
      collaborators,
      selectedElementIds,
      editingElement,
      resizingElement,
      draggingElement,
      selectionElement,
      ...rest
    } = rawAppState;
    return rest;
  };

  // Clean appState when restoring to Excalidraw (ensuring collaborators is a valid Map)
  const cleanAppStateForRestore = (rawAppState: any) => {
    if (!rawAppState || typeof rawAppState !== "object") return undefined;
    const {
      collaborators,
      selectedElementIds,
      editingElement,
      resizingElement,
      draggingElement,
      selectionElement,
      ...rest
    } = rawAppState;

    return {
      ...rest,
      collaborators: new Map(),
    };
  };

  // Load existing whiteboard data from database on mount
  useEffect(() => {
    if (!excalidrawAPI || !projectId) return;

    const loadWhiteboardData = async () => {
      try {
        const res = await axios.get(`/api/whiteboard?projectId=${projectId}`);
        const data = res.data?.data;

        if (data && data.elements) {
          lastSavedElementsRef.current = JSON.stringify(data.elements);
          excalidrawAPI.updateScene({
            elements: data.elements,
            appState: cleanAppStateForRestore(data.appState),
          });

          if (data.files) {
            excalidrawAPI.addFiles(data.files);
          }
        }
      } catch (err) {
        console.error("Failed to load existing whiteboard data:", err);
      } finally {
        isLoadedRef.current = true;
      }
    };

    loadWhiteboardData();
  }, [excalidrawAPI, projectId]);

  // Execute direct save
  const performSave = async (elements: readonly any[], appState: any, files: any) => {
    if (!projectId) return;

    try {
      setSaveStatus("saving");
      const serialized = JSON.stringify(elements);
      await axios.post("/api/whiteboard", {
        elements: elements,
        appState: sanitizeAppStateForSave(appState),
        files: files,
        projectId: projectId,
      });

      lastSavedElementsRef.current = serialized;
      pendingDataRef.current = null;
      setSaveStatus("saved");
    } catch (error) {
      console.error("Error saving canvas:", error);
      setSaveStatus("unsaved");
      toast.add({
        type: "error",
        title: "Save Failed",
        description: "Could not save whiteboard changes.",
      });
    }
  };

  const handleCanvasChange = (
    elements: readonly any[],
    appState: any,
    files: any,
  ) => {
    setCanvasState(appState);

    // Find Selected Elements (filter only truthy IDs)
    const selectedIds = Object.keys(appState.selectedElementIds || {}).filter(
      (id) => appState.selectedElementIds[id] === true,
    );

    if (selectedIds.length === 1) {
      const element = elements.find((element) => element.id === selectedIds[0]);
      setSelectedElement(element || null);
    } else {
      setSelectedElement(null);
    }

    // Do not trigger save before initial load finishes
    if (!isLoadedRef.current) return;

    // Check if elements actually changed compared to last saved state
    const currentSerialized = JSON.stringify(elements);
    if (currentSerialized === lastSavedElementsRef.current) {
      return;
    }

    pendingDataRef.current = { elements: [...elements], appState, files };
    setSaveStatus("unsaved");

    // Cancel Previous 5-second Timer
    if (saveTimeRef.current) {
      clearTimeout(saveTimeRef.current);
    }

    // 5-Second Debounced Auto-Save
    saveTimeRef.current = setTimeout(async () => {
      await performSave(elements, appState, files);
    }, 5000);
  };

  // Flush pending save before unmounting or closing tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingDataRef.current && projectId) {
        const { elements, appState, files } = pendingDataRef.current;
        navigator.sendBeacon?.(
          "/api/whiteboard",
          JSON.stringify({ projectId, elements, appState, files }),
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (saveTimeRef.current) {
        clearTimeout(saveTimeRef.current);
      }
    };
  }, [projectId]);

  const changeTool = (tool: any) => {
    if (!excalidrawAPI) return;

    setActiveTool(tool);
    excalidrawAPI.setActiveTool({
      type: tool,
    });
  };

  const getFloatingPosition = () => {
    if (!selectedElement || !canvasState) {
      return { left: 0, top: 0, visible: false };
    }

    const { x, y, width, height } = selectedElement;
    const zoomValue =
      canvasState.zoom?.value ??
      (typeof canvasState.zoom === "number" ? canvasState.zoom : 1);
    const scrollX = canvasState.scrollX ?? 0;
    const scrollY = canvasState.scrollY ?? 0;
    const offsetLeft = canvasState.offsetLeft ?? 0;
    const offsetTop = canvasState.offsetTop ?? 0;

    // Convert canvas coordinates to screen coordinates
    const screenX = (x + scrollX) * zoomValue + offsetLeft;
    const screenY = (y + scrollY) * zoomValue + offsetTop;
    const elementWidth = (width || 0) * zoomValue;
    const elementHeight = (height || 0) * zoomValue;

    // Center horizontally above the selected element
    const left = screenX + elementWidth / 2;
    const top = screenY - 50; // 50px above element

    return {
      left,
      top: Math.max(10, top),
      screenX,
      screenY,
      width: elementWidth,
      height: elementHeight,
      visible: true,
    };
  };

  return (
    <div className="relative w-full">
      <div style={{ height: "90vh" }}>
        <Excalidraw
          onChange={handleCanvasChange}
          //@ts-ignore
          excalidrawAPI={(api) => {
            setExcalidrawAPI(api);
            onAPIReady(api);
          }}
        />

        {/* Auto-Save Status Pill */}
        <div className="absolute top-4 right-4 z-40 pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-card/90 backdrop-blur-md border border-border-divider shadow-xs text-xs font-medium transition-all">
            {saveStatus === "saving" && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                <span className="text-navy font-semibold">Saving changes...</span>
              </>
            )}
            {saveStatus === "unsaved" && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                <span className="text-slate-text">Auto-saving in 5s...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span className="text-slate-text">All changes saved</span>
              </>
            )}
          </div>
        </div>

        {selectedElement && (
          <FloatingProperties
            selectedElement={selectedElement}
            excalidrawAPI={excalidrawAPI}
            position={getFloatingPosition()}
          />
        )}

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
