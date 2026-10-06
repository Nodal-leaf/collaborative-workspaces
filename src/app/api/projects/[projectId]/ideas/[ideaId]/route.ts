import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CreateIdeaSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { recordActivity } from "@/lib/activity";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; ideaId: string }> }
) {
  try {
    const { projectId, ideaId } = await params;
    const body = await req.json();
    const validated = CreateIdeaSchema.partial().parse(body);
    const currentUser = await getCurrentUser();

    const updated = await prisma.idea.update({
      where: { id: ideaId },
      data: validated,
    });

    await recordActivity({
      projectId,
      user: currentUser.name,
      action: `updated idea status to ${updated.status}`,
      entityType: "IDEA",
      entityTitle: updated.title,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH idea error:", error);
    return NextResponse.json({ error: error.message || "Failed to update idea" }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; ideaId: string }> }
) {
  try {
    const { projectId, ideaId } = await params;
    const currentUser = await getCurrentUser();

    const existing = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    await prisma.idea.delete({
      where: { id: ideaId },
    });

    if (existing) {
      await recordActivity({
        projectId,
        user: currentUser.name,
        action: "deleted an idea",
        entityType: "IDEA",
        entityTitle: existing.title,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE idea error:", error);
    return NextResponse.json({ error: "Failed to delete idea" }, { status: 500 });
  }
}
