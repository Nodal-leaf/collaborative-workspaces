import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CreateDecisionSchema } from "@/lib/validation";
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

    const where: any = { projectId };
    if (search) {
      where.OR = [
        { decision: { contains: search } },
        { context: { contains: search } },
        { chosenSolution: { contains: search } },
        { alternativesConsidered: { contains: search } },
        { madeBy: { contains: search } },
      ];
    }

    const decisions = await prisma.decision.findMany({
      where,
      orderBy: { date: "desc" },
      include: { user: true },
    });

    return NextResponse.json(decisions);
  } catch (error) {
    console.error("GET decisions error:", error);
    return NextResponse.json({ error: "Failed to fetch decisions" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    const validated = CreateDecisionSchema.parse(body);
    const currentUser = await getCurrentUser();

    const decision = await prisma.decision.create({
      data: {
        projectId,
        decision: validated.decision,
        context: validated.context,
        chosenSolution: validated.chosenSolution,
        alternativesConsidered: validated.alternativesConsidered,
        madeBy: validated.madeBy || currentUser.name,
        date: validated.date ? new Date(validated.date) : new Date(),
        createdById: currentUser.id,
      },
    });

    await recordActivity({
      projectId,
      user: currentUser.name,
      action: "recorded a decision",
      entityType: "DECISION",
      entityTitle: decision.decision,
    });

    return NextResponse.json(decision, { status: 201 });
  } catch (error: any) {
    console.error("POST decision error:", error);
    return NextResponse.json({ error: error.message || "Invalid input" }, { status: 400 });
  }
}
