import { boards, db, users, WhiteboardData } from "@/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "ProjectId is required" },
        { status: 400 },
      );
    }

    const data = await db
      .select()
      .from(WhiteboardData)
      .where(eq(WhiteboardData.projectId, projectId));

    if (!data || data.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: data[0] });
  } catch (e: any) {
    console.error("Error fetching whiteboard data:", e);
    return NextResponse.json(
      { error: e?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { projectId, elements, files, appState } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "ProjectId is required" },
        { status: 400 },
      );
    }

    // Try to get authenticated user from Clerk
    let userEmail: string = "user@whizboard.local";
    let userName: string = "User";

    try {
      const user = await currentUser();
      if (user) {
        userEmail =
          user.primaryEmailAddress?.emailAddress ||
          user.emailAddresses?.[0]?.emailAddress ||
          userEmail;
        userName =
          user.fullName ||
          `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
          user.username ||
          userName;
      }
    } catch (authErr) {
      console.warn("Could not retrieve Clerk user in whiteboard API:", authErr);
    }

    // 1. Ensure user exists in users table
    try {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userEmail));

      if (existingUser.length === 0) {
        await db.insert(users).values({
          name: userName,
          email: userEmail,
        });
      }
    } catch (userErr) {
      console.warn("User table check/insert notice:", userErr);
    }

    // 2. Ensure board exists in boards table to satisfy foreign key constraint
    try {
      const existingBoard = await db
        .select()
        .from(boards)
        .where(eq(boards.projectId, projectId));

      if (existingBoard.length === 0) {
        await db.insert(boards).values({
          projectId: projectId,
          projectName: "Untitled Board",
          userEmail: userEmail,
        });
      }
    } catch (boardErr) {
      console.warn("Board table check/insert notice:", boardErr);
    }

    // Sanitize JSON payloads
    let safeElements: any[] = [];
    let safeAppState: any = {};
    let safeFiles: any = {};

    try {
      if (Array.isArray(elements)) {
        safeElements = JSON.parse(JSON.stringify(elements));
      }
    } catch {
      safeElements = [];
    }

    try {
      if (appState && typeof appState === "object") {
        safeAppState = JSON.parse(JSON.stringify(appState));
      }
    } catch {
      safeAppState = {};
    }

    try {
      if (files && typeof files === "object") {
        safeFiles = JSON.parse(JSON.stringify(files));
      }
    } catch {
      safeFiles = {};
    }

    // 3. Upsert whiteboard data
    const result = await db
      .insert(WhiteboardData)
      .values({
        projectId: projectId,
        elements: safeElements,
        appState: safeAppState,
        files: safeFiles,
      })
      .onConflictDoUpdate({
        target: WhiteboardData.projectId,
        set: {
          elements: safeElements,
          appState: safeAppState,
          files: safeFiles,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({
      success: true,
      message: "Canvas saved successfully",
      result,
    });
  } catch (e: any) {
    console.error("Error saving whiteboard data:", e);
    return NextResponse.json(
      { error: e?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
