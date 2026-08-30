"use client";
import SmartDoc from "@/components/custom/workspace/SmartDoc";
import Whiteboard from "@/components/custom/workspace/Whiteboard";
import WorkspaceHeader from "@/components/custom/workspace/WorkspaceHeader";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "@/components/ui/toast";

const Workspace = () => {
  const [activeTab, setActiveTab] = useState("whiteboard");
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [projectName, setProjectName] = useState('');
  const { projectId } = useParams();

  useEffect(() => {
    if (projectId) {
      GetWhiteboardData();
    }
  }, [projectId, api]);

  const GetWhiteboardData = async () => {
    try {
      const result = await axios.get("/api/projects?projectId=" + projectId);
      if (!result?.data) return;

      console.log("Whiteboard Data:", result.data);
      const name =
        typeof result?.data?.projectName === "string"
          ? result.data.projectName
          : result?.data?.projectName?.projectName ||
            result?.data?.project?.projectName ||
            "";
      if (name) {
        setProjectName(name);
      }

      if (api) {
        const safeElements = normalizeElements(result.data.elements);
        const safeAppState = normalizeAppState(result.data.appState);

        api.updateScene({
          elements: safeElements,
          appState: safeAppState,
        });

        if (result.data.files && typeof result.data.files === "object") {
          const filesArray = Object.values(result.data.files) as any[];
          if (filesArray.length > 0) {
            api.addFiles(filesArray);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load whiteboard data:", err);
    }
  };

  const handleManualSave = async () => {
    if (!api || !projectId) return;

    try {
      toast.add({
        type: "info",
        title: "Saving...",
        description: "Saving whiteboard changes.",
      });

      const appState = api.getAppState() as any;
      const {
        collaborators,
        selectedElementIds,
        editingElement,
        resizingElement,
        draggingElement,
        selectionElement,
        ...safeAppState
      } = appState || {};

      await axios.post("/api/whiteboard", {
        elements: api.getSceneElements(),
        appState: safeAppState,
        files: api.getFiles(),
        projectId: projectId,
      });

      toast.add({
        type: "success",
        title: "Saved!",
        description: "All changes successfully saved.",
      });
    } catch (err) {
      console.error("Manual save failed:", err);
      toast.add({
        type: "error",
        title: "Save Failed",
        description: "Could not save whiteboard canvas.",
      });
    }
  };

  const handleExportImage = async () => {
    if (!api) return;

    const { exportToBlob } = await import("@excalidraw/excalidraw");

    const blob = await exportToBlob({
      elements: api.getSceneElements(),
      appState: {
        ...api.getAppState(),
        exportBackground: true,
      },
      files: api.getFiles(),
      mimeType: "image/png",
      quality: 1,
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "whiteboard.png";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div>
      <WorkspaceHeader
        projectName={projectName}
        selectedTab={(value) => setActiveTab(value)}
        onExport={() => handleExportImage()}
        onSave={() => handleManualSave()}
      />

      {activeTab == "whiteboard" ? (
        <Whiteboard onAPIReady={(api) => setApi(api)} />
      ) : (
        <SmartDoc />
      )}
    </div>
  );
};

export default Workspace;

function normalizeAppState(rawAppState: any) {
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
}

function normalizeElements(rawElements: any[]) {
  if (!Array.isArray(rawElements)) return [];
  return rawElements.map((el) => {
    if (!el || typeof el !== "object") return el;
    return {
      ...el,
      groupIds: Array.isArray(el.groupIds) ? el.groupIds : [],
      boundElements: Array.isArray(el.boundElements) ? el.boundElements : null,
      frameId: el.frameId ?? null,
      locked: el.locked ?? false,
      angle: el.angle ?? 0,
    };
  });
}
