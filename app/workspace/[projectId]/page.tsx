"use client";
import SmartDoc from "@/components/custom/workspace/SmartDoc";
import Whiteboard from "@/components/custom/workspace/Whiteboard";
import WorkspaceHeader from "@/components/custom/workspace/WorkspaceHeader";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "@/components/ui/toast";

const Workspace = () => {
  const [activeTab, setActiveTab] = useState("whiteboard");
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const { projectId } = useParams();

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
