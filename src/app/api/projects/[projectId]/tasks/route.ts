import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CreateTaskSchema } from "@/lib/validation";
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
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";

    const where: any = { projectId };
    if (status && status !== "All") {
      where.status = status;
    }
    if (priority && priority !== "All") {
      where.priority = priority;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { assignee: { contains: search } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { user: true },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    const validated = CreateTaskSchema.parse(body);
    const currentUser = await getCurrentUser();

    // Get max order
    const lastTask = await prisma.task.findFirst({
      where: { projectId },
      orderBy: { order: "desc" },
    });
    const nextOrder = (lastTask?.order ?? 0) + 1;

    const task = await prisma.task.create({
      data: {
        projectId,
        title: validated.title,
        description: validated.description,
        assignee: validated.assignee || currentUser.name,
        status: validated.status,
        priority: validated.priority,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        order: nextOrder,
        createdById: currentUser.id,
      },
    });

    await recordActivity({
      projectId,
      user: currentUser.name,
      action: "added a task",
      entityType: "TASK",
      entityTitle: task.title,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error("POST task error:", error);
    return NextResponse.json({ error: error.message || "Invalid input" }, { status: 400 });
  }
}
