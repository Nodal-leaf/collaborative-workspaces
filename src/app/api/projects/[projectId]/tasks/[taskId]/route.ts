import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CreateTaskSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { recordActivity } from "@/lib/activity";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  try {
    const { projectId, taskId } = await params;
    const body = await req.json();
    const validated = CreateTaskSchema.partial().parse(body);
    const currentUser = await getCurrentUser();

    const data: any = { ...validated };
    if (validated.dueDate !== undefined) {
      data.dueDate = validated.dueDate ? new Date(validated.dueDate) : null;
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data,
    });

    await recordActivity({
      projectId,
      user: currentUser.name,
      action: `updated task status to ${updated.status}`,
      entityType: "TASK",
      entityTitle: updated.title,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH task error:", error);
    return NextResponse.json({ error: error.message || "Failed to update task" }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  try {
    const { projectId, taskId } = await params;
    const currentUser = await getCurrentUser();

    const existing = await prisma.task.findUnique({
      where: { id: taskId },
    });

    await prisma.task.delete({
      where: { id: taskId },
    });

    if (existing) {
      await recordActivity({
        projectId,
        user: currentUser.name,
        action: "deleted a task",
        entityType: "TASK",
        entityTitle: existing.title,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE task error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
