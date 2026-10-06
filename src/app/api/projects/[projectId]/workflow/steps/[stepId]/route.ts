import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CreateWorkflowStepSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { recordActivity } from "@/lib/activity";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; stepId: string }> }
) {
  try {
    const { projectId, stepId } = await params;
    const body = await req.json();
    const validated = CreateWorkflowStepSchema.partial().parse(body);
    const currentUser = await getCurrentUser();

    const updated = await prisma.workflowStep.update({
      where: { id: stepId },
      data: validated,
    });

    const actionText =
      validated.isCompleted !== undefined
        ? validated.isCompleted
          ? "marked workflow step as complete"
          : "reopened workflow step"
        : "updated workflow step";

    await recordActivity({
      projectId,
      user: currentUser.name,
      action: actionText,
      entityType: "WORKFLOW",
      entityTitle: updated.title,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH workflow step error:", error);
    return NextResponse.json({ error: error.message || "Failed to update step" }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; stepId: string }> }
) {
  try {
    const { projectId, stepId } = await params;
    const currentUser = await getCurrentUser();

    const existing = await prisma.workflowStep.findUnique({
      where: { id: stepId },
    });

    await prisma.workflowStep.delete({
      where: { id: stepId },
    });

    if (existing) {
      await recordActivity({
        projectId,
        user: currentUser.name,
        action: "deleted a workflow step",
        entityType: "WORKFLOW",
        entityTitle: existing.title,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE workflow step error:", error);
    return NextResponse.json({ error: "Failed to delete step" }, { status: 500 });
  }
}
