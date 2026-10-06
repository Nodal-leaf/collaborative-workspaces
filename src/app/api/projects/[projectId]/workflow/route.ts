import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CreateWorkflowStepSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { recordActivity } from "@/lib/activity";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    let workflow = await prisma.workflow.findFirst({
      where: { projectId },
      include: {
        steps: {
          orderBy: { order: "asc" },
          include: {
            children: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!workflow) {
      // Auto-create default workflow if none exists
      workflow = await prisma.workflow.create({
        data: {
          projectId,
          title: "Final Executable Workflow",
          description: "Step-by-step execution plan for the project.",
        },
        include: {
          steps: {
            include: { children: true },
          },
        },
      });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("GET workflow error:", error);
    return NextResponse.json({ error: "Failed to fetch workflow" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    const validated = CreateWorkflowStepSchema.parse(body);
    const currentUser = await getCurrentUser();

    let workflow = await prisma.workflow.findFirst({
      where: { projectId },
    });

    if (!workflow) {
      workflow = await prisma.workflow.create({
        data: {
          projectId,
          title: "Final Executable Workflow",
        },
      });
    }

    // Determine order
    const lastStep = await prisma.workflowStep.findFirst({
      where: {
        workflowId: workflow.id,
        parentId: validated.parentId || null,
      },
      orderBy: { order: "desc" },
    });
    const nextOrder = (lastStep?.order ?? 0) + 1;

    const step = await prisma.workflowStep.create({
      data: {
        workflowId: workflow.id,
        parentId: validated.parentId || null,
        title: validated.title,
        description: validated.description,
        assignee: validated.assignee || currentUser.name,
        notes: validated.notes,
        resources: validated.resources,
        isCompleted: validated.isCompleted ?? false,
        order: nextOrder,
      },
    });

    await recordActivity({
      projectId,
      user: currentUser.name,
      action: "added a workflow step",
      entityType: "WORKFLOW",
      entityTitle: step.title,
    });

    return NextResponse.json(step, { status: 201 });
  } catch (error: any) {
    console.error("POST workflow step error:", error);
    return NextResponse.json({ error: error.message || "Invalid input" }, { status: 400 });
  }
}
