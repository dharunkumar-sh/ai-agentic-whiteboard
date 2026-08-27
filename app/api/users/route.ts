import { db, users } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
      return NextResponse.json(
        { message: "No primary email address found" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (userData.length > 0) {
      return NextResponse.json(userData[0]);
    } else {
      const name =
        user.fullName ||
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
        user.username ||
        "User";

      const result = await db
        .insert(users)
        .values({
          name: name,
          email: email,
        })
        .returning();

      return NextResponse.json(result[0]);
    }
  } catch (error) {
    console.error("Error in /api/users:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
