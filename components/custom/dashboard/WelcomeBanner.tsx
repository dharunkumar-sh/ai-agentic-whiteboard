"use client";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, Sparkles } from "lucide-react";
import React from "react";

const WelcomeBanner = () => {
  const { user } = useUser();
  const firstName = user?.fullName;

  return (
    <div className="p-8 sm:p-10 pt-16 sm:pt-18 border border-border-divider rounded-2xl sm:rounded-3xl bg-linear-to-r from-pink-50/60 via-white to-purple-50/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative overflow-hidden shadow-2xs">
      {/* Tablet-like Badge - Top Left */}
      <div className="absolute top-5 left-6 sm:top-6 sm:left-8 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-purple-200/80 text-accent-purple font-medium text-xs sm:text-sm shadow-xs backdrop-blur-xs">
        <div className="w-5 h-5 rounded-full bg-accent-purple/10 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-accent-purple" />
        </div>
        <span>Your creative workspace</span>
      </div>

      {/* Left Content */}
      <div className="flex-1 max-w-2xl">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy">
          Welcome back,{" "}
          <span className="bg-linear-to-r from-accent-purple to-primary-blue bg-clip-text text-transparent">
            {firstName}
          </span>
          <span className="inline-block ml-1">👋</span>
        </h2>

        <p className="mt-2 text-slate-text text-base font-normal">
          Turn your ideas into diagrams, notes and visuals on an infinite canvas.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-6">
          <Button className="bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl px-5 py-2.5 h-auto font-medium shadow-xs flex items-center gap-2">
            <span>Create New Board</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="bg-card-surface hover:bg-ai-light-purple border-border-divider text-navy rounded-xl px-5 py-2.5 h-auto font-medium shadow-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-accent-purple" />
            <span>Ask AI</span>
          </Button>
        </div>
      </div>

      {/* Right Canvas / Whiteboard Preview Widget */}
      <div className="hidden sm:flex flex-col gap-3 p-5 rounded-2xl bg-white border border-border-divider shadow-sm w-full sm:w-72 md:w-80 shrink-0">
        {/* Window controls */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
        </div>

        {/* Sticky Chips */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="bg-amber-100 text-amber-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs flex items-center gap-1">
            <span>New Idea</span>
            <span>✨</span>
          </div>
          <div className="bg-purple-100 text-purple-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs">
            AI Brainstorm
          </div>
        </div>

        <div className="flex justify-center pt-0.5">
          <div className="bg-blue-50 text-blue-900 text-xs font-medium px-4 py-1.5 rounded-lg border border-blue-100/60 shadow-2xs">
            Design → Build → Ship
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;

