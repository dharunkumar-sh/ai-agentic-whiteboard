"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  GripVertical,
  Sparkles,
  Copy,
  Trash2,
  Layers,
  ChevronDown,
  Palette,
  PaintBucket,
  MoveUp,
  MoveDown,
  Sliders,
  Check,
  Ban,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

interface FloatingPropertiesProps {
  selectedElement: any;
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  position: {
    left: number;
    top: number;
    visible?: boolean;
    width?: number;
    height?: number;
  };
}

const STROKE_COLORS = [
  { label: "Dark", value: "#1E293B" },
  { label: "Primary Blue", value: "#2F6BFF" },
  { label: "Accent Purple", value: "#8B5CF6" },
  { label: "Success Green", value: "#34A853" },
  { label: "Warning Orange", value: "#F59E0B" },
  { label: "Danger Red", value: "#EF4444" },
  { label: "Pink", value: "#EC4899" },
  { label: "Teal", value: "#0D9488" },
  { label: "Slate", value: "#64748B" },
];

const BG_COLORS = [
  { label: "Transparent", value: "transparent" },
  { label: "Soft Blue", value: "#EEF4FF" },
  { label: "Soft Purple", value: "#F3EFFF" },
  { label: "Soft Green", value: "#EAF8EC" },
  { label: "Soft Orange", value: "#FFF4DF" },
  { label: "Soft Red", value: "#FEE2E2" },
  { label: "Soft Teal", value: "#E6FBF7" },
  { label: "Soft Gray", value: "#F3F4F6" },
  { label: "Dark Slate", value: "#1E293B" },
];

const STROKE_WIDTHS = [
  { label: "Thin", value: 1, height: "h-0.5" },
  { label: "Medium", value: 2, height: "h-1" },
  { label: "Bold", value: 4, height: "h-1.5" },
];

const STROKE_STYLES = [
  { label: "Solid", value: "solid", borderClass: "border-solid" },
  { label: "Dashed", value: "dashed", borderClass: "border-dashed" },
  { label: "Dotted", value: "dotted", borderClass: "border-dotted" },
];

const FILL_STYLES = [
  { label: "Hachure", value: "hachure" },
  { label: "Cross-Hatch", value: "cross-hatch" },
  { label: "Solid", value: "solid" },
  { label: "Zigzag", value: "zigzag" },
];

const ROUGHNESS_OPTIONS = [
  { label: "Architect", value: 0, desc: "Clean lines" },
  { label: "Artist", value: 1, desc: "Hand-drawn" },
  { label: "Cartoonist", value: 2, desc: "Playful sketch" },
];

const OPACITIES = [100, 75, 50, 25];

const FloatingProperties = ({
  selectedElement,
  excalidrawAPI,
  position,
}: FloatingPropertiesProps) => {
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const prevElementIdRef = useRef<string | null>(null);

  // Reset drag position when the selected element changes
  useEffect(() => {
    if (selectedElement?.id !== prevElementIdRef.current) {
      setDragOffset({ x: 0, y: 0 });
      prevElementIdRef.current = selectedElement?.id || null;
    }
  }, [selectedElement?.id]);

  if (!selectedElement || position.visible === false) return null;

  const currentStrokeColor = selectedElement.strokeColor || "#1E293B";
  const currentBgColor = selectedElement.backgroundColor || "transparent";
  const currentStrokeWidth = selectedElement.strokeWidth || 1;
  const currentStrokeStyle = selectedElement.strokeStyle || "solid";
  const currentFillStyle = selectedElement.fillStyle || "hachure";
  const currentRoughness = selectedElement.roughness ?? 1;
  const currentOpacity = selectedElement.opacity ?? 100;

  const handleDragStart = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const startX = e.clientX - dragOffset.x;
    const startY = e.clientY - dragOffset.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      setDragOffset({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const updateElement = (updates: Record<string, any>) => {
    if (!excalidrawAPI || !selectedElement) return;

    const elements = excalidrawAPI.getSceneElements();
    const updatedElements = elements.map((el) => {
      if (el.id === selectedElement.id) {
        return {
          ...el,
          ...updates,
          version: (el.version || 0) + 1,
          versionNonce: Math.floor(Math.random() * 1000000000),
        };
      }
      return el;
    });

    excalidrawAPI.updateScene({
      elements: updatedElements,
    });
  };

  const handleDuplicate = () => {
    if (!excalidrawAPI || !selectedElement) return;
    const elements = excalidrawAPI.getSceneElements();
    const newElement = {
      ...selectedElement,
      id: `${selectedElement.id}_copy_${Date.now()}`,
      x: selectedElement.x + 24,
      y: selectedElement.y + 24,
      version: 1,
      versionNonce: Math.floor(Math.random() * 1000000000),
    };

    excalidrawAPI.updateScene({
      elements: [...elements, newElement],
      appState: {
        ...excalidrawAPI.getAppState(),
        selectedElementIds: { [newElement.id]: true },
      },
    });
  };

  const handleDelete = () => {
    if (!excalidrawAPI || !selectedElement) return;
    const elements = excalidrawAPI.getSceneElements();
    const filtered = elements.filter((el) => el.id !== selectedElement.id);

    excalidrawAPI.updateScene({
      elements: filtered,
      appState: {
        ...excalidrawAPI.getAppState(),
        selectedElementIds: {},
      },
    });
  };

  const handleBringToFront = () => {
    if (!excalidrawAPI || !selectedElement) return;
    const elements = excalidrawAPI.getSceneElements();
    const el = elements.find((e) => e.id === selectedElement.id);
    if (!el) return;
    const rest = elements.filter((e) => e.id !== selectedElement.id);
    excalidrawAPI.updateScene({
      elements: [...rest, el],
    });
  };

  const handleSendToBack = () => {
    if (!excalidrawAPI || !selectedElement) return;
    const elements = excalidrawAPI.getSceneElements();
    const el = elements.find((e) => e.id === selectedElement.id);
    if (!el) return;
    const rest = elements.filter((e) => e.id !== selectedElement.id);
    excalidrawAPI.updateScene({
      elements: [el, ...rest],
    });
  };

  return (
    <TooltipProvider delay={150}>
      <div
        className={`fixed z-50 pointer-events-auto will-change-transform ${
          isDragging ? "cursor-grabbing select-none" : ""
        }`}
        style={{
          left: `${position.left + dragOffset.x}px`,
          top: `${position.top + dragOffset.y}px`,
          transform: "translate(-50%, -100%)",
        }}
      >
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-white/95 dark:bg-card/95 backdrop-blur-md border border-border-divider/90 shadow-xl shadow-navy/5 text-foreground animate-in fade-in duration-100">
          {/* Drag Handle */}
          <div
            onPointerDown={handleDragStart}
            className="flex items-center justify-center px-1 py-1.5 rounded-xl hover:bg-secondary text-muted-text hover:text-navy cursor-grab active:cursor-grabbing transition-colors group touch-none"
            title="Drag to move anywhere"
          >
            <GripVertical className="w-3.5 h-3.5 text-slate-text/70 group-hover:text-navy transition-colors" />
          </div>

          <div className="w-px h-5 bg-border-divider mx-0.5" />

          {/* AI Magic Action */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => {
                    // Future AI Action Trigger
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-linear-to-r from-purple-50 via-white to-blue-50 border border-purple-200/70 hover:border-purple-300 text-accent-purple font-medium text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent-purple group-hover:rotate-12 transition-transform" />
                  <span className="bg-linear-to-r from-accent-purple to-primary-blue bg-clip-text text-transparent font-semibold">
                    AI Polish
                  </span>
                </button>
              }
            />
            <TooltipContent side="top">
              <span>Enhance or format with AI</span>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border-divider mx-0.5" />

          {/* Stroke Color Popover */}
          <Popover>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  title="Stroke Color"
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl hover:bg-secondary transition cursor-pointer text-xs font-medium text-slate-text hover:text-foreground"
                >
                  <div
                    className="w-4 h-4 rounded-full border border-black/10 shadow-2xs shrink-0"
                    style={{ backgroundColor: currentStrokeColor }}
                  />
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
              }
            />
            <PopoverContent className="w-48 p-3 rounded-2xl shadow-xl bg-white border border-border-divider">
              <div className="text-xs font-semibold text-navy mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-primary-blue" />
                <span>Stroke Color</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {STROKE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => updateElement({ strokeColor: color.value })}
                    className="relative w-6 h-6 rounded-lg border border-black/10 shadow-2xs hover:scale-110 transition flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  >
                    {currentStrokeColor === color.value && (
                      <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Background Color Popover */}
          <Popover>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  title="Background Fill"
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl hover:bg-secondary transition cursor-pointer text-xs font-medium text-slate-text hover:text-foreground"
                >
                  <div
                    className="w-4 h-4 rounded-full border border-black/10 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden"
                    style={{
                      backgroundColor:
                        currentBgColor === "transparent"
                          ? "#ffffff"
                          : currentBgColor,
                    }}
                  >
                    {currentBgColor === "transparent" && (
                      <Ban className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
              }
            />
            <PopoverContent className="w-48 p-3 rounded-2xl shadow-xl bg-white border border-border-divider">
              <div className="text-xs font-semibold text-navy mb-2 flex items-center gap-1.5">
                <PaintBucket className="w-3.5 h-3.5 text-accent-purple" />
                <span>Background Fill</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {BG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      updateElement({ backgroundColor: color.value })
                    }
                    className="relative w-6 h-6 rounded-lg border border-black/10 shadow-2xs hover:scale-110 transition flex items-center justify-center cursor-pointer overflow-hidden bg-white"
                    style={{
                      backgroundColor:
                        color.value === "transparent" ? "#FFFFFF" : color.value,
                    }}
                    title={color.label}
                  >
                    {color.value === "transparent" ? (
                      <Ban className="w-3.5 h-3.5 text-red-400" />
                    ) : currentBgColor === color.value ? (
                      <Check className="w-3.5 h-3.5 text-navy drop-shadow-xs" />
                    ) : null}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="w-px h-5 bg-border-divider mx-0.5" />

          {/* Stroke Width & Style Settings Popover */}
          <Popover>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  title="Stroke & Style"
                  className="flex items-center gap-1 p-2 rounded-xl hover:bg-secondary text-slate-text hover:text-navy transition cursor-pointer"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              }
            />
            <PopoverContent className="w-56 p-3.5 rounded-2xl shadow-xl bg-white border border-border-divider flex flex-col gap-3">
              {/* Stroke Width */}
              <div>
                <span className="text-[11px] font-medium text-muted-text block mb-1.5">
                  Stroke Width
                </span>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-muted">
                  {STROKE_WIDTHS.map((width) => (
                    <button
                      key={width.value}
                      type="button"
                      onClick={() =>
                        updateElement({ strokeWidth: width.value })
                      }
                      className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        currentStrokeWidth === width.value
                          ? "bg-white text-primary-blue shadow-xs"
                          : "text-slate-text hover:text-navy"
                      }`}
                    >
                      <div
                        className={`w-6 bg-current rounded-full ${width.height}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Stroke Style */}
              <div>
                <span className="text-[11px] font-medium text-muted-text block mb-1.5">
                  Stroke Style
                </span>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-muted">
                  {STROKE_STYLES.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() =>
                        updateElement({ strokeStyle: style.value })
                      }
                      className={`flex items-center justify-center py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                        currentStrokeStyle === style.value
                          ? "bg-white text-primary-blue shadow-xs"
                          : "text-slate-text hover:text-navy"
                      }`}
                    >
                      <div
                        className={`w-6 border-t-2 border-current ${style.borderClass}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Fill Style */}
              <div>
                <span className="text-[11px] font-medium text-muted-text block mb-1.5">
                  Fill Style
                </span>
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-muted">
                  {FILL_STYLES.map((fill) => (
                    <button
                      key={fill.value}
                      type="button"
                      onClick={() => updateElement({ fillStyle: fill.value })}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer text-center ${
                        currentFillStyle === fill.value
                          ? "bg-white text-primary-blue shadow-xs"
                          : "text-slate-text hover:text-navy"
                      }`}
                    >
                      {fill.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Roughness / Style */}
              <div>
                <span className="text-[11px] font-medium text-muted-text block mb-1.5">
                  Sloppiness
                </span>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-muted">
                  {ROUGHNESS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateElement({ roughness: opt.value })}
                      className={`px-1.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer text-center ${
                        currentRoughness === opt.value
                          ? "bg-white text-primary-blue shadow-xs"
                          : "text-slate-text hover:text-navy"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity */}
              <div>
                <span className="text-[11px] font-medium text-muted-text block mb-1.5">
                  Opacity
                </span>
                <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-muted">
                  {OPACITIES.map((opacity) => (
                    <button
                      key={opacity}
                      type="button"
                      onClick={() => updateElement({ opacity })}
                      className={`py-1 rounded-lg text-xs font-medium transition cursor-pointer text-center ${
                        currentOpacity === opacity
                          ? "bg-white text-primary-blue shadow-xs"
                          : "text-slate-text hover:text-navy"
                      }`}
                    >
                      {opacity}%
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Layering Popover */}
          <Popover>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  title="Layers"
                  className="flex items-center gap-1 p-2 rounded-xl hover:bg-secondary text-slate-text hover:text-navy transition cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                </button>
              }
            />
            <PopoverContent className="w-40 p-1.5 rounded-2xl shadow-xl bg-white border border-border-divider flex flex-col gap-1">
              <button
                type="button"
                onClick={handleBringToFront}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-secondary text-xs font-medium text-navy transition cursor-pointer"
              >
                <MoveUp className="w-3.5 h-3.5 text-primary-blue" />
                <span>Bring to Front</span>
              </button>
              <button
                type="button"
                onClick={handleSendToBack}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-secondary text-xs font-medium text-navy transition cursor-pointer"
              >
                <MoveDown className="w-3.5 h-3.5 text-slate-text" />
                <span>Send to Back</span>
              </button>
            </PopoverContent>
          </Popover>

          <div className="w-px h-5 bg-border-divider mx-0.5" />

          {/* Duplicate Button */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="p-2 rounded-xl hover:bg-secondary text-slate-text hover:text-navy transition cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                </button>
              }
            />
            <TooltipContent side="top">Duplicate</TooltipContent>
          </Tooltip>

          {/* Delete Button */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2 rounded-xl hover:bg-red-50 text-slate-text hover:text-destructive transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              }
            />
            <TooltipContent side="top">Delete</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default FloatingProperties;
