import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    const { items } = body as { items: { id: string; order: number; parentId?: string | null }[] };

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid reorder payload" }, { status: 400 });
    }

    // Update each step's order
    await prisma.$transaction(
      items.map((item) =>
        prisma.workflowStep.update({
          where: { id: item.id },
          data: {
            order: item.order,
            ...(item.parentId !== undefined ? { parentId: item.parentId } : {}),
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST workflow reorder error:", error);
    return NextResponse.json({ error: "Failed to reorder steps" }, { status: 500 });
  }
}
