import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CreateResourceSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { recordActivity } from "@/lib/activity";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; resourceId: string }> }
) {
  try {
    const { projectId, resourceId } = await params;
    const body = await req.json();
    const validated = CreateResourceSchema.partial().parse(body);
    const currentUser = await getCurrentUser();

    const updated = await prisma.resource.update({
      where: { id: resourceId },
      data: validated,
    });

    await recordActivity({
      projectId,
      user: currentUser.name,
      action: "updated a resource",
      entityType: "RESOURCE",
      entityTitle: updated.title,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH resource error:", error);
    return NextResponse.json({ error: error.message || "Failed to update resource" }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; resourceId: string }> }
) {
  try {
    const { projectId, resourceId } = await params;
    const currentUser = await getCurrentUser();

    const existing = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    await prisma.resource.delete({
      where: { id: resourceId },
    });

    if (existing) {
      await recordActivity({
        projectId,
        user: currentUser.name,
        action: "deleted a resource",
        entityType: "RESOURCE",
        entityTitle: existing.title,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE resource error:", error);
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}
