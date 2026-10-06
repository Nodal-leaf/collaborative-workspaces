import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CreateLinkSchema } from "@/lib/validation";
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

    const where: any = { projectId };
    if (category && category !== "All") {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { url: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const links = await prisma.link.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error("GET links error:", error);
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    const validated = CreateLinkSchema.parse(body);
    const currentUser = await getCurrentUser();

    const link = await prisma.link.create({
      data: {
        projectId,
        name: validated.name,
        url: validated.url,
        description: validated.description,
        category: validated.category,
        createdById: currentUser.id,
      },
    });

    await recordActivity({
      projectId,
      user: currentUser.name,
      action: "added a link",
      entityType: "LINK",
      entityTitle: link.name,
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error: any) {
    console.error("POST link error:", error);
    return NextResponse.json({ error: error.message || "Invalid input" }, { status: 400 });
  }
}
