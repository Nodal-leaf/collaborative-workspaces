import { prisma } from "./db/prisma";

export async function recordActivity({
  projectId,
  user,
  action,
  entityType,
  entityTitle,
}: {
  projectId: string;
  user: string;
  action: string;
  entityType: "RESOURCE" | "IDEA" | "LINK" | "DECISION" | "TASK" | "WORKFLOW" | "PROJECT";
  entityTitle: string;
}) {
  try {
    return await prisma.activity.create({
      data: {
        projectId,
        user: user || "Team Member",
        action,
        entityType,
        entityTitle,
      },
    });
  } catch (error) {
    console.error("Failed to record activity log:", error);
    return null;
  }
}
