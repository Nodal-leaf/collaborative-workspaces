import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CreateProjectSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { recordActivity } from "@/lib/activity";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            resources: true,
            ideas: true,
            links: true,
            decisions: true,
            tasks: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateProjectSchema.parse(body);
    const currentUser = await getCurrentUser();

    const project = await prisma.project.create({
      data: {
        name: validated.name,
        description: validated.description,
        problem: validated.problem,
        goal: validated.goal,
        currentStatus: validated.currentStatus,
        members: {
          create: {
            userId: currentUser.id,
            role: "OWNER",
          },
        },
        workflows: {
          create: {
            title: "Final Executable Workflow",
            description: "Initial structured workflow for the project.",
            steps: {
              create: [
                { title: "1. Preparation", description: "Review scope, requirements, and prerequisite tools.", order: 1 },
                { title: "2. Setup", description: "Initialize development environment and configuration.", order: 2 },
                { title: "3. Data / Environment", description: "Setup data pipelines and testing fixtures.", order: 3 },
                { title: "4. Core Implementation", description: "Build main features and modules.", order: 4 },
                { title: "5. Integration", description: "Connect systems and frontend/backend bridges.", order: 5 },
                { title: "6. Testing", description: "Execute test suite and verify edge cases.", order: 6 },
                { title: "7. Evaluation", description: "Measure accuracy, latency, and success metrics.", order: 7 },
                { title: "8. Deployment", description: "Deploy to production hosting infrastructure.", order: 8 },
                { title: "9. Final Demo", description: "Prepare presentation, live demo run, and submission.", order: 9 },
              ],
            },
          },
        },
      },
    });

    await recordActivity({
      projectId: project.id,
      user: currentUser.name,
      action: "created the project",
      entityType: "PROJECT",
      entityTitle: project.name,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: error.message || "Invalid input" }, { status: 400 });
  }
}
