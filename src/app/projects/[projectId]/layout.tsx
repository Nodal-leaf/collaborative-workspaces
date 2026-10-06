import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { ProjectSidebar } from "@/components/layout/project-sidebar";
import { ProjectHeader } from "@/components/layout/project-header";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        include: { user: true },
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
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#090a0f] text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <ProjectSidebar
        projectId={project.id}
        projectName={project.name}
        counts={{
          resources: project._count.resources,
          ideas: project._count.ideas,
          links: project._count.links,
          decisions: project._count.decisions,
          tasks: project._count.tasks,
        }}
        members={project.members}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <ProjectHeader project={project} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
