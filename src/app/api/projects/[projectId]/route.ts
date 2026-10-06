import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { UpdateProjectSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { recordActivity } from "@/lib/activity";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            resources: true,
            ideas: true,
            links: true,
            decisions: true,
            tasks: true,
          },
        },
        activities: {
          take: 20,
          orderBy: { createdAt: "desc" },
        },
        decisions: {
          take: 5,
          orderBy: { date: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("GET /api/projects/[projectId] error:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    const validated = UpdateProjectSchema.parse(body);
    const currentUser = await getCurrentUser();

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: validated,
    });

    await recordActivity({
      projectId,
      user: currentUser.name,
      action: "updated project overview",
      entityType: "PROJECT",
      entityTitle: updated.name,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH /api/projects/[projectId] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update project" }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/projects/[projectId] error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
