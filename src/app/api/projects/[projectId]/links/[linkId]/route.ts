import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CreateLinkSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { recordActivity } from "@/lib/activity";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; linkId: string }> }
) {
  try {
    const { projectId, linkId } = await params;
    const body = await req.json();
    const validated = CreateLinkSchema.partial().parse(body);
    const currentUser = await getCurrentUser();

    const updated = await prisma.link.update({
      where: { id: linkId },
      data: validated,
    });

    await recordActivity({
      projectId,
      user: currentUser.name,
      action: "updated a link",
      entityType: "LINK",
      entityTitle: updated.name,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH link error:", error);
    return NextResponse.json({ error: error.message || "Failed to update link" }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; linkId: string }> }
) {
  try {
    const { projectId, linkId } = await params;
    const currentUser = await getCurrentUser();

    const existing = await prisma.link.findUnique({
      where: { id: linkId },
    });

    await prisma.link.delete({
      where: { id: linkId },
    });

    if (existing) {
      await recordActivity({
        projectId,
        user: currentUser.name,
        action: "deleted a link",
        entityType: "LINK",
        entityTitle: existing.name,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE link error:", error);
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  }
}
