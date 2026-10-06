import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CreateResourceSchema } from "@/lib/validation";
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
    const category = searchParams.get("category") || "";
    const sortBy = searchParams.get("sortBy") || "newest"; // newest, oldest, title

    const where: any = { projectId };
    if (category && category !== "All") {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
        { author: { contains: search } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") orderBy = { createdAt: "asc" };
    if (sortBy === "title") orderBy = { title: "asc" };

    const resources = await prisma.resource.findMany({
      where,
      orderBy,
      include: {
        user: true,
      },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("GET resources error:", error);
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    const validated = CreateResourceSchema.parse(body);
    const currentUser = await getCurrentUser();

    const resource = await prisma.resource.create({
      data: {
        projectId,
        title: validated.title,
        description: validated.description,
        url: validated.url,
        category: validated.category,
        tags: validated.tags || "",
        imageUrl: validated.imageUrl || null,
        author: validated.author || currentUser.name,
        createdById: currentUser.id,
      },
    });

    await recordActivity({
      projectId,
      user: currentUser.name,
      action: "added a resource",
      entityType: "RESOURCE",
      entityTitle: resource.title,
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error: any) {
    console.error("POST resource error:", error);
    return NextResponse.json({ error: error.message || "Invalid input" }, { status: 400 });
  }
}
