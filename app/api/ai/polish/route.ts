import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { element, action = "beautify", customPrompt = "" } = await req.json();

    if (!element) {
      return NextResponse.json(
        { error: "Selected element is required for AI Polish." },
        { status: 400 },
      );
    }

    const apiKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API Key not configured in environment." },
        { status: 500 },
      );
    }

    let instruction = "";
    if (action === "auto-beautify" || action === "beautify") {
      instruction =
        "Apply complete visual beautification: choose an aesthetically balanced modern color pair (harmonious background and stroke), 1-2px crisp stroke, 0 or 1 roughness, solid fill, and appropriate contrast for readable text.";
    } else if (action === "glassmorphic") {
      instruction =
        "Transform into a Soft Glassmorphic / Modern Pastel Card: soft translucent pastel background fill (e.g. #EEF4FF, #F3EFFF, #EAF8EC, #FFF4DF, #E6FBF7), subtle crisp stroke (#3B82F6, #8B5CF6, #10B981), solid fillStyle, 0 roughness, and roundness: {type: 3}.";
    } else if (action === "dark-mode") {
      instruction =
        "Transform into a Sleek Dark-Mode SaaS Component: dark slate or pitch black background (#0F172A or #1E293B), neon/vibrant glowing accent stroke (#38BDF8, #818CF8, #A855F7, or #34D399), solid fillStyle, 0 roughness, and high-contrast light text.";
    } else if (action === "vibrant-pop") {
      instruction =
        "Transform into a Vibrant Brand Pop style: energetic modern color scheme with high visual impact, vivid border/stroke (#2563EB, #D946EF, #F97316), soft tint background, solid fill, and crisp 2px stroke.";
    } else if (action === "hand-drawn") {
      instruction =
        "Transform into a Charming Hand-Drawn Sketch style: artist roughness (1 or 2), hachure or cross-hatch fillStyle, hand-drawn Virgil font (fontFamily: 1), 2px organic stroke, and playful sketch look.";
    } else if (action === "minimalist") {
      instruction =
        "Transform into an Ultra-Clean Minimalist style: pure 0 roughness architect precision, hairline/thin 1px stroke (#1E293B or #000000), pure white or transparent background, solid fill, and clean sans-serif typography (fontFamily: 2).";
    } else {
      instruction =
        "Apply clean modern visual design enhancements, color harmony, and balanced proportions.";
    }

    const promptText = `
You are an expert design systems & UI/UX polishing assistant for whiteboard Excalidraw canvas elements.
Target Element:
${JSON.stringify(element, null, 2)}

Design Enhancement Goal: ${instruction}

CRITICAL RULES:
1. Return ONLY a valid raw JSON object. Do not include markdown codeblocks (\`\`\` or \`\`\`json).
2. The JSON object MUST strictly follow this format:
{
  "updates": {
    "backgroundColor": "#hex or transparent",
    "strokeColor": "#hex",
    "strokeWidth": 1, 2, or 3,
    "strokeStyle": "solid", "dashed", or "dotted",
    "fillStyle": "solid", "hachure", "cross-hatch", or "zigzag",
    "roughness": 0, 1, or 2,
    "opacity": 100,
    "roundness": {"type": 3} or null,
    "fontFamily": 1, 2, or 3,
    "fontSize": 16, 20, 24, or 28,
    "textAlign": "center" or "left"
  }
}
3. Maintain valid hex color codes and proper Excalidraw attributes.
`;

    const candidateModels = [
      ["google/gemma-4-31b-it:free", "google/gemma-4-26b-a4b-it:free", "openrouter/free"],
      ["meta-llama/llama-3.3-70b-instruct:free", "qwen/qwen-2.5-72b-instruct:free", "openrouter/free"],
      ["openrouter/free"],
    ];

    let response: any = null;
    let lastError: any = null;
    let usedModel = "google/gemma-4-31b-it:free";

    for (const modelGroup of candidateModels) {
      try {
        response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            models: modelGroup,
            messages: [
              {
                role: "system",
                content:
                  "You are an expert whiteboard AI polish assistant. Output ONLY valid raw JSON objects containing 'updates' and optional 'newElements'.",
              },
              {
                role: "user",
                content: promptText,
              },
            ],
            temperature: 0.2,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer":
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              "X-Title": "AI Agentic Whiteboard",
              "Content-Type": "application/json",
            },
            timeout: 25000,
          },
        );

        if (response?.data?.choices?.[0]?.message?.content) {
          usedModel = response.data?.model || modelGroup[0];
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(
          `OpenRouter AI Polish attempt with [${modelGroup.join(", ")}] failed:`,
          err?.response?.data || err?.message,
        );
      }
    }

    if (!response?.data) {
      const errMsg =
        lastError?.response?.data?.error?.message ||
        lastError?.response?.data?.message ||
        lastError?.message ||
        "All candidate AI models were temporarily busy.";
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    const rawContent = response.data?.choices?.[0]?.message?.content || "";
    let updates: any = {};
    let newElements: any[] = [];

    if (rawContent) {
      try {
        let cleaned = rawContent.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
        }

        const firstBrace = cleaned.indexOf("{");
        const lastBrace = cleaned.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleaned = cleaned.slice(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(cleaned);
        if (parsed.updates) {
          updates = parsed.updates;
        } else {
          updates = parsed;
        }
        if (Array.isArray(parsed.newElements)) {
          newElements = parsed.newElements;
        }
      } catch (parseErr) {
        console.warn("Failed to parse AI Polish JSON output:", parseErr);
      }
    }

    return NextResponse.json({
      success: true,
      updates,
      newElements,
      model: usedModel,
    });
  } catch (error: any) {
    console.error(
      "AI Polish error:",
      error?.response?.data || error?.message,
    );

    const errorMessage =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to polish element with AI.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
