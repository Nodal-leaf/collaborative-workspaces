import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CreateIdeaSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { recordActivity } from "@/lib/activity";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: any = { projectId };
    if (status && status !== "All") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { contributor: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const ideas = await prisma.idea.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    return NextResponse.json(ideas);
  } catch (error) {
    console.error("GET ideas error:", error);
    return NextResponse.json({ error: "Failed to fetch ideas" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    const validated = CreateIdeaSchema.parse(body);
    const currentUser = await getCurrentUser();

    const idea = await prisma.idea.create({
      data: {
        projectId,
        title: validated.title,
        description: validated.description,
        contributor: validated.contributor || currentUser.name,
        tags: validated.tags || "",
        status: validated.status,
        createdById: currentUser.id,
      },
    });

    await recordActivity({
      projectId,
      user: currentUser.name,
      action: "added an idea",
      entityType: "IDEA",
      entityTitle: idea.title,
    });

    return NextResponse.json(idea, { status: 201 });
  } catch (error: any) {
    console.error("POST idea error:", error);
    return NextResponse.json({ error: error.message || "Invalid input" }, { status: 400 });
  }
}
