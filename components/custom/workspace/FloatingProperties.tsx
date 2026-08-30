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
  Loader2,
  Wand2,
  FileText,
  Layout,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Square,
  ArrowRight,
  CornerUpRight,
  Moon,
  Zap,
  Pencil,
} from "lucide-react";
import axios from "axios";
import { toast } from "@/components/ui/toast";
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
  // Neutrals & Monochromes
  { label: "Dark Slate", value: "#1E293B" },
  { label: "Pitch Black", value: "#000000" },
  { label: "Charcoal", value: "#334155" },
  { label: "Muted Slate", value: "#64748B" },
  { label: "Silver Gray", value: "#94A3B8" },
  { label: "Pure White", value: "#FFFFFF" },

  // Blues & Purples
  { label: "Primary Blue", value: "#2F6BFF" },
  { label: "Deep Navy", value: "#1E3A8A" },
  { label: "Sky Blue", value: "#0EA5E9" },
  { label: "Cyan", value: "#06B6D4" },
  { label: "Indigo", value: "#6366F1" },
  { label: "Accent Purple", value: "#8B5CF6" },
  { label: "Deep Violet", value: "#7C3AED" },

  // Pinks & Reds
  { label: "Hot Pink", value: "#EC4899" },
  { label: "Fuchsia", value: "#D946EF" },
  { label: "Rose", value: "#F43F5E" },
  { label: "Danger Red", value: "#EF4444" },
  { label: "Crimson", value: "#DC2626" },

  // Oranges, Yellows & Warm
  { label: "Coral Orange", value: "#F97316" },
  { label: "Warning Amber", value: "#F59E0B" },
  { label: "Warm Gold", value: "#EAB308" },
  { label: "Lime", value: "#84CC16" },
  { label: "Brown", value: "#78350F" },

  // Greens & Teals
  { label: "Success Green", value: "#22C55E" },
  { label: "Emerald Green", value: "#10B981" },
  { label: "Forest Green", value: "#15803D" },
  { label: "Teal", value: "#0D9488" },
];

const BG_COLORS = [
  // Transparent & Neutrals
  { label: "Transparent", value: "transparent" },
  { label: "Pure White", value: "#FFFFFF" },
  { label: "Soft Gray", value: "#F1F5F9" },
  { label: "Warm Stone", value: "#F5F5F4" },
  { label: "Slate Dark", value: "#1E293B" },
  { label: "Pitch Black", value: "#000000" },

  // Soft Pastels
  { label: "Soft Blue", value: "#EEF4FF" },
  { label: "Soft Sky", value: "#E0F2FE" },
  { label: "Soft Indigo", value: "#EEF2FF" },
  { label: "Soft Purple", value: "#F3EFFF" },
  { label: "Soft Violet", value: "#EDE9FE" },
  { label: "Soft Pink", value: "#FDF2F8" },
  { label: "Soft Rose", value: "#FFE4E6" },
  { label: "Soft Red", value: "#FEE2E2" },
  { label: "Soft Orange", value: "#FFF4DF" },
  { label: "Soft Amber", value: "#FEF3C7" },
  { label: "Soft Yellow", value: "#FEF9C3" },
  { label: "Soft Lime", value: "#ECFCCB" },
  { label: "Soft Green", value: "#EAF8EC" },
  { label: "Soft Emerald", value: "#D1FAE5" },
  { label: "Soft Teal", value: "#E6FBF7" },
  { label: "Soft Cyan", value: "#CFFAFE" },

  // Solid Vibrant Fills
  { label: "Solid Blue", value: "#3B82F6" },
  { label: "Solid Indigo", value: "#6366F1" },
  { label: "Solid Purple", value: "#A855F7" },
  { label: "Solid Pink", value: "#EC4899" },
  { label: "Solid Red", value: "#EF4444" },
  { label: "Solid Orange", value: "#F97316" },
  { label: "Solid Amber", value: "#F59E0B" },
  { label: "Solid Green", value: "#22C55E" },
  { label: "Solid Teal", value: "#14B8A6" },
];

const STROKE_WIDTHS = [
  { label: "Thin", value: 1, thickness: "h-0.5" },
  { label: "Regular", value: 2, thickness: "h-1" },
  { label: "Medium", value: 3, thickness: "h-1.5" },
  { label: "Bold", value: 4, thickness: "h-2" },
  { label: "Heavy", value: 6, thickness: "h-2.5" },
];

const STROKE_STYLES = [
  { label: "Solid", value: "solid", borderClass: "border-solid" },
  { label: "Dashed", value: "dashed", borderClass: "border-dashed" },
  { label: "Dotted", value: "dotted", borderClass: "border-dotted" },
];

const CORNER_ROUNDNESS = [
  { label: "Sharp", value: null, desc: "0px" },
  { label: "Round", value: { type: 3 }, desc: "Soft" },
  { label: "Curved", value: { type: 2 }, desc: "Max" },
];

const FILL_STYLES = [
  { label: "Solid", value: "solid" },
  { label: "Hachure", value: "hachure" },
  { label: "Cross-Hatch", value: "cross-hatch" },
  { label: "Zigzag", value: "zigzag" },
];

const ROUGHNESS_OPTIONS = [
  { label: "Architect", value: 0, desc: "Clean & sharp" },
  { label: "Artist", value: 1, desc: "Hand-drawn" },
  { label: "Cartoonist", value: 2, desc: "Playful sketch" },
];

const FONT_FAMILIES = [
  { label: "Hand-drawn", value: 1, fontClass: "font-serif italic" },
  { label: "Normal", value: 2, fontClass: "font-sans font-medium" },
  { label: "Code", value: 3, fontClass: "font-mono" },
];

const FONT_SIZES = [
  { label: "S", value: 16 },
  { label: "M", value: 20 },
  { label: "L", value: 28 },
  { label: "XL", value: 36 },
];

const TEXT_ALIGNS = [
  { label: "Left", value: "left", icon: AlignLeft },
  { label: "Center", value: "center", icon: AlignCenter },
  { label: "Right", value: "right", icon: AlignRight },
];

const ARROWHEAD_OPTIONS = [
  { label: "None", value: null },
  { label: "Arrow", value: "arrow" },
  { label: "Triangle", value: "triangle" },
  { label: "Dot", value: "dot" },
  { label: "Bar", value: "bar" },
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
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishPopoverOpen, setPolishPopoverOpen] = useState(false);
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

  const handleAIPolish = async (action: string) => {
    if (!excalidrawAPI || !selectedElement || isPolishing) return;

    try {
      setIsPolishing(true);
      toast.add({
        type: "info",
        title: "AI Polishing...",
        description: "Applying design enhancements to your element.",
      });

      const res = await axios.post("/api/ai/polish", {
        element: selectedElement,
        action,
      });

      const { updates } = res.data;

      if (updates && typeof updates === "object") {
        updateElement(updates);
      }

      toast.add({
        type: "success",
        title: "AI Polish Applied!",
        description: "Design style updated successfully.",
      });
      setPolishPopoverOpen(false);
    } catch (error: any) {
      console.error("AI Polish error:", error);
      toast.add({
        type: "error",
        title: "Polish Failed",
        description:
          error?.response?.data?.error || "Could not apply AI Polish.",
      });
    } finally {
      setIsPolishing(false);
    }
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

          {/* AI Polish Popover */}
          <Popover open={polishPopoverOpen} onOpenChange={setPolishPopoverOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  disabled={isPolishing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-linear-to-r from-purple-50 via-white to-blue-50 border border-purple-200/80 hover:border-purple-300 text-accent-purple font-medium text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer group disabled:opacity-50"
                >
                  {isPolishing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-purple" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-accent-purple group-hover:rotate-12 transition-transform" />
                  )}
                  <span className="bg-linear-to-r from-accent-purple to-primary-blue bg-clip-text text-transparent font-semibold">
                    {isPolishing ? "Polishing..." : "AI Polish"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-accent-purple/70" />
                </button>
              }
            />
            <PopoverContent className="w-72 p-3 rounded-2xl shadow-xl bg-white border border-border-divider flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-border-divider/70 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-navy">
                  <Sparkles className="w-4 h-4 text-accent-purple" />
                  <span>Design Polish Presets</span>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-accent-purple border border-purple-200/60">
                  AI Design
                </span>
              </div>

              <div className="flex flex-col gap-1 max-h-80 overflow-y-auto pr-0.5">
                {/* 1. Auto Beautify */}
                <button
                  type="button"
                  disabled={isPolishing}
                  onClick={() => handleAIPolish("auto-beautify")}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-medium text-navy hover:bg-purple-50/70 hover:text-accent-purple transition cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Wand2 className="w-3.5 h-3.5 text-accent-purple" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs leading-tight">
                      Auto Beautify
                    </p>
                    <p className="text-[10px] text-muted-text">
                      Harmonize color, border & typography
                    </p>
                  </div>
                </button>

                {/* 2. Glassmorphic Pastel */}
                <button
                  type="button"
                  disabled={isPolishing}
                  onClick={() => handleAIPolish("glassmorphic")}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-medium text-navy hover:bg-blue-50/70 hover:text-primary-blue transition cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Layout className="w-3.5 h-3.5 text-primary-blue" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs leading-tight">
                      Glassmorphic Pastel
                    </p>
                    <p className="text-[10px] text-muted-text">
                      Translucent soft fill & fine borders
                    </p>
                  </div>
                </button>

                {/* 3. Dark Mode SaaS */}
                <button
                  type="button"
                  disabled={isPolishing}
                  onClick={() => handleAIPolish("dark-mode")}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-medium text-navy hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Moon className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs leading-tight">
                      Dark Mode SaaS
                    </p>
                    <p className="text-[10px] text-muted-text">
                      Sleek dark card with neon glow accents
                    </p>
                  </div>
                </button>

                {/* 4. Vibrant Brand Pop */}
                <button
                  type="button"
                  disabled={isPolishing}
                  onClick={() => handleAIPolish("vibrant-pop")}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-medium text-navy hover:bg-amber-50/70 hover:text-amber-600 transition cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs leading-tight">
                      Vibrant Brand Pop
                    </p>
                    <p className="text-[10px] text-muted-text">
                      High-contrast energetic brand aesthetic
                    </p>
                  </div>
                </button>

                {/* 5. Hand-Drawn Sketch */}
                <button
                  type="button"
                  disabled={isPolishing}
                  onClick={() => handleAIPolish("hand-drawn")}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-medium text-navy hover:bg-orange-50/70 hover:text-orange-600 transition cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Pencil className="w-3.5 h-3.5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs leading-tight">
                      Hand-Drawn Sketch
                    </p>
                    <p className="text-[10px] text-muted-text">
                      Charming organic notebook sketch look
                    </p>
                  </div>
                </button>

                {/* 6. Clean Minimalist */}
                <button
                  type="button"
                  disabled={isPolishing}
                  onClick={() => handleAIPolish("minimalist")}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-medium text-navy hover:bg-emerald-50/70 hover:text-emerald-600 transition cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Square className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs leading-tight">
                      Clean Minimalist
                    </p>
                    <p className="text-[10px] text-muted-text">
                      Architectural precision & clean lines
                    </p>
                  </div>
                </button>
              </div>
            </PopoverContent>
          </Popover>

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
            <PopoverContent className="w-64 p-3 rounded-2xl shadow-xl bg-white border border-border-divider">
              <div className="text-xs font-semibold text-navy mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-primary-blue" />
                  <span>Stroke Color</span>
                </div>
                <span className="text-[10px] font-mono text-muted-text uppercase">
                  {currentStrokeColor}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1.5 mb-2.5 max-h-48 overflow-y-auto pr-0.5">
                {STROKE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => updateElement({ strokeColor: color.value })}
                    className="relative w-6 h-6 rounded-lg border border-black/10 shadow-2xs hover:scale-110 transition flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  >
                    {currentStrokeColor.toLowerCase() ===
                      color.value.toLowerCase() && (
                      <Check className="w-3 h-3 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
              {/* Custom Color Input */}
              <div className="pt-2 border-t border-border-divider flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-text font-medium">
                  Custom
                </span>
                <label className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border-divider hover:bg-secondary cursor-pointer transition">
                  <input
                    type="color"
                    value={
                      currentStrokeColor.startsWith("#")
                        ? currentStrokeColor
                        : "#1E293B"
                    }
                    onChange={(e) =>
                      updateElement({ strokeColor: e.target.value })
                    }
                    className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="text-[10.5px] font-mono text-navy">
                    {currentStrokeColor.startsWith("#")
                      ? currentStrokeColor
                      : "Pick"}
                  </span>
                </label>
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
            <PopoverContent className="w-64 p-3 rounded-2xl shadow-xl bg-white border border-border-divider">
              <div className="text-xs font-semibold text-navy mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <PaintBucket className="w-3.5 h-3.5 text-accent-purple" />
                  <span>Background Fill</span>
                </div>
                <span className="text-[10px] font-mono text-muted-text uppercase">
                  {currentBgColor}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1.5 mb-2.5 max-h-48 overflow-y-auto pr-0.5">
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
                      <Ban className="w-3 h-3 text-red-400" />
                    ) : currentBgColor.toLowerCase() ===
                      color.value.toLowerCase() ? (
                      <Check className="w-3 h-3 text-navy drop-shadow-xs" />
                    ) : null}
                  </button>
                ))}
              </div>
              {/* Custom Color Input */}
              <div className="pt-2 border-t border-border-divider flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-text font-medium">
                  Custom
                </span>
                <label className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border-divider hover:bg-secondary cursor-pointer transition">
                  <input
                    type="color"
                    value={
                      currentBgColor.startsWith("#")
                        ? currentBgColor
                        : "#FFFFFF"
                    }
                    onChange={(e) =>
                      updateElement({ backgroundColor: e.target.value })
                    }
                    className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="text-[10.5px] font-mono text-navy">
                    {currentBgColor.startsWith("#") ? currentBgColor : "Pick"}
                  </span>
                </label>
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
                  title="Element Styles & Customizations"
                  className="flex items-center gap-1 p-2 rounded-xl hover:bg-secondary text-slate-text hover:text-navy transition cursor-pointer"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              }
            />
            <PopoverContent className="w-72 p-3.5 rounded-2xl shadow-xl bg-white border border-border-divider flex flex-col gap-3.5 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border-divider/70 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-navy">
                  <Sliders className="w-3.5 h-3.5 text-primary-blue" />
                  <span>Customize Element</span>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-text capitalize">
                  {selectedElement.type}
                </span>
              </div>

              {/* Stroke Width */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-medium text-muted-text mb-1.5">
                  <span>Stroke Width</span>
                  <span className="font-mono text-[10px] text-navy font-semibold">
                    {currentStrokeWidth}px
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-secondary/50 border border-border-divider/50">
                  {STROKE_WIDTHS.map((width) => (
                    <button
                      key={width.value}
                      type="button"
                      onClick={() =>
                        updateElement({ strokeWidth: width.value })
                      }
                      className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[10.5px] font-medium transition cursor-pointer ${
                        currentStrokeWidth === width.value
                          ? "bg-white text-primary-blue shadow-xs font-semibold"
                          : "text-slate-text hover:text-navy"
                      }`}
                      title={`${width.label} (${width.value}px)`}
                    >
                      <div
                        className={`w-5 bg-current rounded-full mb-1 ${width.thickness}`}
                      />
                      <span>{width.value}px</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stroke Style */}
              <div>
                <span className="text-[11px] font-medium text-muted-text block mb-1.5">
                  Stroke Style
                </span>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-secondary/50 border border-border-divider/50">
                  {STROKE_STYLES.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() =>
                        updateElement({ strokeStyle: style.value })
                      }
                      className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[10.5px] font-medium transition cursor-pointer ${
                        currentStrokeStyle === style.value
                          ? "bg-white text-primary-blue shadow-xs font-semibold"
                          : "text-slate-text hover:text-navy"
                      }`}
                    >
                      <div
                        className={`w-6 border-t-2 border-current mb-1 ${style.borderClass}`}
                      />
                      <span>{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Corner Roundness (for rectangles/containers) */}
              {selectedElement.type === "rectangle" && (
                <div>
                  <span className="text-[11px] font-medium text-muted-text block mb-1.5">
                    Corner Roundness
                  </span>
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-secondary/50 border border-border-divider/50">
                    {CORNER_ROUNDNESS.map((opt, idx) => {
                      const isSelected =
                        (opt.value === null &&
                          !selectedElement.roundness) ||
                        (opt.value &&
                          selectedElement.roundness?.type ===
                            opt.value.type);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            updateElement({ roundness: opt.value })
                          }
                          className={`py-1.5 rounded-lg text-xs font-medium transition cursor-pointer text-center ${
                            isSelected
                              ? "bg-white text-primary-blue shadow-xs font-semibold"
                              : "text-slate-text hover:text-navy"
                          }`}
                        >
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Fill Style */}
              {selectedElement.type !== "line" &&
                selectedElement.type !== "arrow" && (
                  <div>
                    <span className="text-[11px] font-medium text-muted-text block mb-1.5">
                      Fill Pattern
                    </span>
                    <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-secondary/50 border border-border-divider/50">
                      {FILL_STYLES.map((fill) => (
                        <button
                          key={fill.value}
                          type="button"
                          onClick={() =>
                            updateElement({ fillStyle: fill.value })
                          }
                          className={`py-1.5 rounded-lg text-[10.5px] font-medium transition cursor-pointer text-center ${
                            currentFillStyle === fill.value
                              ? "bg-white text-primary-blue shadow-xs font-semibold"
                              : "text-slate-text hover:text-navy"
                          }`}
                        >
                          {fill.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Sloppiness */}
              <div>
                <span className="text-[11px] font-medium text-muted-text block mb-1.5">
                  Sloppiness & Roughness
                </span>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-secondary/50 border border-border-divider/50">
                  {ROUGHNESS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateElement({ roughness: opt.value })}
                      className={`py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer text-center ${
                        currentRoughness === opt.value
                          ? "bg-white text-primary-blue shadow-xs font-semibold"
                          : "text-slate-text hover:text-navy"
                      }`}
                      title={opt.desc}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity with Interactive Slider */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-medium text-muted-text mb-1.5">
                  <span>Opacity</span>
                  <span className="font-mono text-[10.5px] text-navy font-semibold">
                    {currentOpacity}%
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={currentOpacity}
                    onChange={(e) =>
                      updateElement({ opacity: Number(e.target.value) })
                    }
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary-blue"
                  />
                </div>
                <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-secondary/50 border border-border-divider/50">
                  {OPACITIES.map((opacity) => (
                    <button
                      key={opacity}
                      type="button"
                      onClick={() => updateElement({ opacity })}
                      className={`py-1 rounded-lg text-[10.5px] font-medium transition cursor-pointer text-center ${
                        currentOpacity === opacity
                          ? "bg-white text-primary-blue shadow-xs font-semibold"
                          : "text-slate-text hover:text-navy"
                      }`}
                    >
                      {opacity}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography Settings (if text element or has text) */}
              {(selectedElement.type === "text" ||
                selectedElement.text !== undefined) && (
                <div className="pt-2 border-t border-border-divider/70 flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-navy">
                    <Type className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Typography</span>
                  </div>

                  {/* Font Family */}
                  <div>
                    <span className="text-[11px] font-medium text-muted-text block mb-1">
                      Font Family
                    </span>
                    <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-secondary/50 border border-border-divider/50">
                      {FONT_FAMILIES.map((font) => (
                        <button
                          key={font.value}
                          type="button"
                          onClick={() =>
                            updateElement({ fontFamily: font.value })
                          }
                          className={`py-1 rounded-lg text-xs transition cursor-pointer text-center ${
                            (selectedElement.fontFamily || 1) === font.value
                              ? "bg-white text-primary-blue shadow-xs font-bold"
                              : "text-slate-text hover:text-navy"
                          } ${font.fontClass}`}
                        >
                          {font.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size & Alignment */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] font-medium text-muted-text block mb-1">
                        Size
                      </span>
                      <div className="grid grid-cols-4 gap-0.5 p-1 rounded-xl bg-secondary/50 border border-border-divider/50">
                        {FONT_SIZES.map((size) => (
                          <button
                            key={size.value}
                            type="button"
                            onClick={() =>
                              updateElement({ fontSize: size.value })
                            }
                            className={`py-1 rounded-lg text-xs font-medium transition cursor-pointer text-center ${
                              (selectedElement.fontSize || 20) === size.value
                                ? "bg-white text-primary-blue shadow-xs font-bold"
                                : "text-slate-text hover:text-navy"
                            }`}
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-muted-text block mb-1">
                        Alignment
                      </span>
                      <div className="grid grid-cols-3 gap-0.5 p-1 rounded-xl bg-secondary/50 border border-border-divider/50">
                        {TEXT_ALIGNS.map((align) => {
                          const Icon = align.icon;
                          const isAlign =
                            (selectedElement.textAlign || "left") ===
                            align.value;
                          return (
                            <button
                              key={align.value}
                              type="button"
                              onClick={() =>
                                updateElement({ textAlign: align.value })
                              }
                              className={`py-1.5 flex items-center justify-center rounded-lg transition cursor-pointer ${
                                isAlign
                                  ? "bg-white text-primary-blue shadow-xs"
                                  : "text-slate-text hover:text-navy"
                              }`}
                              title={align.label}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Arrow Endpoints (if arrow/line element) */}
              {(selectedElement.type === "arrow" ||
                selectedElement.type === "line") && (
                <div className="pt-2 border-t border-border-divider/70 flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-navy">
                    <CornerUpRight className="w-3.5 h-3.5 text-violet-500" />
                    <span>Arrowheads</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] font-medium text-muted-text block mb-1">
                        Start Point
                      </span>
                      <select
                        value={selectedElement.startArrowhead || ""}
                        onChange={(e) =>
                          updateElement({
                            startArrowhead: e.target.value || null,
                          })
                        }
                        className="w-full text-xs p-1.5 rounded-lg border border-border-divider bg-secondary/30 text-navy font-medium cursor-pointer"
                      >
                        {ARROWHEAD_OPTIONS.map((opt) => (
                          <option key={String(opt.value)} value={opt.value || ""}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-muted-text block mb-1">
                        End Point
                      </span>
                      <select
                        value={selectedElement.endArrowhead || ""}
                        onChange={(e) =>
                          updateElement({
                            endArrowhead: e.target.value || null,
                          })
                        }
                        className="w-full text-xs p-1.5 rounded-lg border border-border-divider bg-secondary/30 text-navy font-medium cursor-pointer"
                      >
                        {ARROWHEAD_OPTIONS.map((opt) => (
                          <option key={String(opt.value)} value={opt.value || ""}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
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
