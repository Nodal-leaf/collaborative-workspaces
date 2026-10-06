import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CreateDecisionSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { recordActivity } from "@/lib/activity";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; decisionId: string }> }
) {
  try {
    const { projectId, decisionId } = await params;
    const body = await req.json();
    const validated = CreateDecisionSchema.partial().parse(body);
    const currentUser = await getCurrentUser();

    const data: any = { ...validated };
    if (validated.date) {
      data.date = new Date(validated.date);
    }

    const updated = await prisma.decision.update({
      where: { id: decisionId },
      data,
    });

    await recordActivity({
      projectId,
      user: currentUser.name,
      action: "updated a decision",
      entityType: "DECISION",
      entityTitle: updated.decision,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH decision error:", error);
    return NextResponse.json({ error: error.message || "Failed to update decision" }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; decisionId: string }> }
) {
  try {
    const { projectId, decisionId } = await params;
    const currentUser = await getCurrentUser();

    const existing = await prisma.decision.findUnique({
      where: { id: decisionId },
    });

    await prisma.decision.delete({
      where: { id: decisionId },
    });

    if (existing) {
      await recordActivity({
        projectId,
        user: currentUser.name,
        action: "deleted a decision",
        entityType: "DECISION",
        entityTitle: existing.decision,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE decision error:", error);
    return NextResponse.json({ error: "Failed to delete decision" }, { status: 500 });
  }
}
