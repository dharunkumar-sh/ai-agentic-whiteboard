import { boards, db, users } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { projectName, projectId } = await req.json();
    const user = await currentUser();

    if (!projectId || !projectName) {
      return NextResponse.json(
        { error: "Project Information Missing" },
        { status: 400 }
      );
    }

    const userEmail = user?.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Ensure user exists in users table to satisfy foreign key constraint
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail));

    if (existingUser.length === 0) {
      const name =
        user.fullName ||
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
        user.username ||
        "User";

      await db.insert(users).values({
        name: name,
        email: userEmail,
      });
    }

    const result = await db
      .insert(boards)
      .values({
        projectId: projectId,
        projectName: projectName,
        userEmail: userEmail,
      })
      .returning();

    return NextResponse.json(result[0] ?? result);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
