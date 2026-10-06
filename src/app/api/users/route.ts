import { NextResponse } from "next/server";
import { getAllUsers, getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const users = await getAllUsers();
    const current = await getCurrentUser();
    return NextResponse.json({ users, current });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
