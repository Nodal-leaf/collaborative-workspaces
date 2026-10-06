import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const filterType = searchParams.get("type") || "ALL"; // ALL, RESOURCE, IDEA, LINK, DECISION, TASK, WORKFLOW

    if (!query.trim()) {
      return NextResponse.json({
        resources: [],
        ideas: [],
        links: [],
        decisions: [],
        tasks: [],
        workflowSteps: [],
        total: 0,
      });
    }

    const q = query.trim();

    const [resources, ideas, links, decisions, tasks, workflowSteps] = await Promise.all([
      filterType === "ALL" || filterType === "RESOURCE"
        ? prisma.resource.findMany({
            where: {
              projectId,
              OR: [
                { title: { contains: q } },
                { description: { contains: q } },
                { tags: { contains: q } },
                { author: { contains: q } },
                { category: { contains: q } },
              ],
            },
            take: 20,
          })
        : [],

      filterType === "ALL" || filterType === "IDEA"
        ? prisma.idea.findMany({
            where: {
              projectId,
              OR: [
                { title: { contains: q } },
                { description: { contains: q } },
                { contributor: { contains: q } },
                { tags: { contains: q } },
                { status: { contains: q } },
              ],
            },
            take: 20,
          })
        : [],

      filterType === "ALL" || filterType === "LINK"
        ? prisma.link.findMany({
            where: {
              projectId,
              OR: [
                { name: { contains: q } },
                { url: { contains: q } },
                { description: { contains: q } },
                { category: { contains: q } },
              ],
            },
            take: 20,
          })
        : [],

      filterType === "ALL" || filterType === "DECISION"
        ? prisma.decision.findMany({
            where: {
              projectId,
              OR: [
                { decision: { contains: q } },
                { context: { contains: q } },
                { chosenSolution: { contains: q } },
                { alternativesConsidered: { contains: q } },
                { madeBy: { contains: q } },
              ],
            },
            take: 20,
          })
        : [],

      filterType === "ALL" || filterType === "TASK"
        ? prisma.task.findMany({
            where: {
              projectId,
              OR: [
                { title: { contains: q } },
                { description: { contains: q } },
                { assignee: { contains: q } },
                { status: { contains: q } },
                { priority: { contains: q } },
              ],
            },
            take: 20,
          })
        : [],

      filterType === "ALL" || filterType === "WORKFLOW"
        ? prisma.workflowStep.findMany({
            where: {
              workflow: { projectId },
              OR: [
                { title: { contains: q } },
                { description: { contains: q } },
                { assignee: { contains: q } },
                { notes: { contains: q } },
                { resources: { contains: q } },
              ],
            },
            take: 20,
          })
        : [],
    ]);

    const total =
      resources.length +
      ideas.length +
      links.length +
      decisions.length +
      tasks.length +
      workflowSteps.length;

    return NextResponse.json({
      resources,
      ideas,
      links,
      decisions,
      tasks,
      workflowSteps,
      total,
    });
  } catch (error) {
    console.error("GET search error:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
