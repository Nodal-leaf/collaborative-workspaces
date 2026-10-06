import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;
    const project = await prisma.project.findUnique({
      where: { shareToken },
      include: {
        members: {
          include: { user: true },
        },
        resources: { orderBy: { createdAt: "desc" } },
        ideas: { orderBy: { createdAt: "desc" } },
        links: { orderBy: { createdAt: "desc" } },
        decisions: { orderBy: { date: "desc" } },
        tasks: { orderBy: [{ order: "asc" }, { createdAt: "desc" }] },
        workflows: {
          include: {
            steps: {
              orderBy: { order: "asc" },
              include: { children: { orderBy: { order: "asc" } } },
            },
          },
        },
        activities: {
          take: 20,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Shared project not found or expired" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("GET /api/share/[shareToken] error:", error);
    return NextResponse.json({ error: "Failed to load shared project" }, { status: 500 });
  }
}
