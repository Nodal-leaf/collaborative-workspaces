# Project Source of Truth

**Project Source of Truth** is a high-density, modern team collaboration operating system designed for fast-moving technical teams and hackathons. It eliminates scattered notes, lost links, forgotten architectural decisions, and disjointed task lists by uniting them into a **single source of truth**.

Think of it as a lightweight synthesis of **Notion × Linear × GitHub Projects**, specifically optimized for technical projects.

---

## Key Features

1. **Dashboard & Project Workspaces**:
   - High-level overview of all team projects with real-time entity metrics.
   - Fast project creator capturing problem definition, success goal, and current status.

2. **Project Overview & Activity Feed**:
   - Single source of truth answering: *What are we building? What problem are we solving? What does success look like?*
   - Live audit activity feed logging team contributions (who added a resource, who updated a task, who made an architecture decision).

3. **Curated Resources Hub**:
   - Collect research papers, GitHub repositories, documentation, tools, datasets, and videos.
   - Filter by category, search by notes/tags, and sort alphabetically or by newest.

4. **Collaborative Idea Board**:
   - Brainstorming hub with an agile status pipeline (`New`, `Discussing`, `Accepted`, `Rejected`, `Implemented`).
   - Tagging, contributor attribution, and instant status updates.

5. **Dedicated Links Directory**:
   - Central directory for Discord servers, Figma files, GitHub repos, staging API gateways, and drive folders.
   - Instant one-click copy and direct launch buttons.

6. **Architecture Decision Records (ADR)**:
   - Lightweight decision log recording context, chosen solution, and alternatives considered.
   - Prevents repetitive debates over past technical choices.

7. **Lightweight Tasks Board**:
   - Kanban and List views for tracking deliverables without Jira bloat.
   - Status tracking (`Backlog`, `Todo`, `In Progress`, `Blocked`, `Done`), priority tags, due dates, and assignees.

8. **Final Executable Workflow**:
   - The team's master execution blueprint: **"If a new member joined today, could they follow this workflow and ship the project?"**
   - Sequential phases with nested substeps, live completion toggles, drag/reorder actions, resource links, and progress bar telemetry.

9. **Global Project Search (⌘K)**:
   - Command palette searching simultaneously across resources, ideas, links, decisions, tasks, and workflow steps.

10. **Link-Based Sharing & Collaboration**:
    - Cryptographically secure share links for external stakeholders and teammates.
    - Configurable permission levels (`VIEW` or `EDIT`).

11. **Linear-Grade Dark & Light Theme**:
    - Polished developer-first typography, custom scrollbars, subtle status badges, and instant keyboard shortcuts.

---

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Linear-inspired design system)
- **Database & ORM**: SQLite for local zero-config portability via Prisma ORM 6 (easily switched to PostgreSQL for production)
- **Validation**: Zod schema validation
- **Icons**: Lucide Icons

---

## Directory Structure

```text
src/
├── app/
│   ├── api/                     # REST API endpoints with Zod validation
│   │   ├── projects/            # Project CRUD & nested entities
│   │   ├── share/               # Public share token resolution
│   │   ├── search/              # Global multi-entity search
│   │   └── users/               # Team member roster & current session
│   ├── dashboard/               # Main project dashboard & launcher
│   ├── projects/[projectId]/    # Project workspace layout & sections
│   │   ├── overview/            # Project goals, problem, decisions, audit trail
│   │   ├── resources/           # Research papers, repos, tools, documentation
│   │   ├── ideas/               # Pipeline idea board
│   │   ├── links/               # Important URLs & directories
│   │   ├── decisions/           # Architecture Decision Records (ADR)
│   │   ├── tasks/               # Kanban & List milestone tracker
│   │   └── workflow/            # Final Executable Workflow & substeps
│   └── share/[shareToken]/      # Public shared workspace view
├── components/
│   ├── layout/                  # Project sidebar & header bars
│   ├── ui/                      # Modal dialogs & interactive controls
│   ├── search-modal.tsx         # ⌘K global command palette
│   ├── share-modal.tsx          # Link sharing & permission settings
│   └── theme-provider.tsx       # Dark & Light mode provider
└── lib/
    ├── db/prisma.ts             # Prisma client singleton
    ├── auth/index.ts            # User session & team roster
    ├── storage/index.ts         # Pluggable storage abstraction (Local/S3/R2)
    ├── validation/index.ts      # Zod validation schemas
    └── activity.ts              # Audit trail logger
```

---

## Getting Started

### 1. Prerequisites
- Node.js 18.18+ or 20+
- npm or pnpm

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```

Default contents of `.env`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="project-source-of-truth-secret-key-super-secure-2026"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup & Migrations
Synchronize the Prisma schema to create the SQLite database:
```bash
npx prisma db push
```

### 5. Seed Realistic Demo Data
Populate the application with the preconfigured demo project **Ragnarok — Agentic AI Challenge**:
```bash
npm run seed
# or
npx tsx prisma/seed.ts
```

This generates realistic resources, ideas, links, architectural decisions, task boards, team members, and the complete Final Executable Workflow.

### 6. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Deployment (PostgreSQL + Vercel / Railway)

To deploy to production with PostgreSQL:
1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set your production PostgreSQL connection string in `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
   ```
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Build and run:
   ```bash
   npm run build
   npm run start
   ```

---

## Future Improvements
- Multi-factor authentication via OAuth (Google, GitHub)
- Real-time WebSocket synchronization (Yjs / Liveblocks)
- S3 / Cloudflare R2 image upload pipeline
- Export project workspace to single Markdown / PDF briefing document
