import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Project Source of Truth database...");

  // 1. Clean existing data
  await prisma.activity.deleteMany({});
  await prisma.workflowStep.deleteMany({});
  await prisma.workflow.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.decision.deleteMany({});
  await prisma.link.deleteMany({});
  await prisma.idea.deleteMany({});
  await prisma.resource.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const userAbdul = await prisma.user.create({
    data: {
      name: "Abdul",
      email: "abdul@project-truth.io",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "OWNER",
    },
  });

  const userSarah = await prisma.user.create({
    data: {
      name: "Sarah Chen",
      email: "sarah@project-truth.io",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      role: "MEMBER",
    },
  });

  const userRahul = await prisma.user.create({
    data: {
      name: "Rahul Verma",
      email: "rahul@project-truth.io",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      role: "MEMBER",
    },
  });

  const userAhmed = await prisma.user.create({
    data: {
      name: "Ahmed Al-Mansoor",
      email: "ahmed@project-truth.io",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      role: "MEMBER",
    },
  });

  const userElena = await prisma.user.create({
    data: {
      name: "Elena Rostova",
      email: "elena@project-truth.io",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
      role: "MEMBER",
    },
  });

  // 3. Create Demo Project: Ragnarok — Agentic AI Challenge
  const project = await prisma.project.create({
    data: {
      name: "Ragnarok — Agentic AI Challenge",
      slug: "ragnarok-agentic-ai",
      description:
        "Autonomous multi-agent system designed for complex competitive benchmark problem solving, self-reflection, and distributed tool use.",
      problem:
        "Autonomous agents frequently hallucinate execution steps, fail to coordinate shared state across sub-agents, and lack robust deterministic fallback mechanisms during competitive hackathon benchmarks.",
      goal:
        "Build an end-to-end agentic workflow achieving >85% benchmark accuracy with <3s step latency, deterministic memory checkpoints, and automated recovery.",
      currentStatus:
        "Core runtime architecture verified. Currently integrating dynamic tool execution pipeline and synthetic evaluation harness.",
      shareToken: "ragnarok-live-share-token",
      shareAccess: "EDIT",
    },
  });

  // 4. Attach Members
  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: userAbdul.id, role: "OWNER" },
      { projectId: project.id, userId: userSarah.id, role: "ADMIN" },
      { projectId: project.id, userId: userRahul.id, role: "MEMBER" },
      { projectId: project.id, userId: userAhmed.id, role: "MEMBER" },
      { projectId: project.id, userId: userElena.id, role: "MEMBER" },
    ],
  });

  // 5. Add Resources
  await prisma.resource.createMany({
    data: [
      {
        projectId: project.id,
        title: "Anthropic Model Context Protocol (MCP) Specification",
        description: "Standardized open protocol connecting AI agents to secure external data sources and execution tools.",
        url: "https://modelcontextprotocol.io/introduction",
        category: "Documentation",
        tags: "agents, mcp, protocol, tools",
        author: "Sarah Chen",
        createdById: userSarah.id,
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
      },
      {
        projectId: project.id,
        title: "LangGraph Multi-Agent Workflows & State Graph",
        description: "Reference architecture for cyclical multi-agent workflows, state checkpoints, and human-in-the-loop branching.",
        url: "https://github.com/langchain-ai/langgraph",
        category: "GitHub repository",
        tags: "multi-agent, state-graph, orchestration",
        author: "Abdul",
        createdById: userAbdul.id,
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80",
      },
      {
        projectId: project.id,
        title: "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?",
        description: "Foundational benchmark dataset evaluating autonomous agents on real GitHub bug resolution inside isolated Docker environments.",
        url: "https://arxiv.org/abs/2310.06770",
        category: "Paper",
        tags: "benchmarks, evaluation, swe-bench",
        author: "Ahmed Al-Mansoor",
        createdById: userAhmed.id,
        imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80",
      },
      {
        projectId: project.id,
        title: "FastAPI Async High-Throughput Gateway",
        description: "Asynchronous concurrency patterns for streaming Server-Sent Events (SSE) during real-time agent step execution.",
        url: "https://fastapi.tiangolo.com/async/",
        category: "Documentation",
        tags: "api, backend, async, sse",
        author: "Rahul Verma",
        createdById: userRahul.id,
      },
      {
        projectId: project.id,
        title: "Self-Refine: Iterative Reasoning with Feedback",
        description: "Algorithmic foundation for autonomous agent self-critique, error localization, and iterative code refinement.",
        url: "https://arxiv.org/abs/2303.17651",
        category: "Paper",
        tags: "prompting, reflection, reasoning",
        author: "Sarah Chen",
        createdById: userSarah.id,
      },
      {
        projectId: project.id,
        title: "AgentOps Observability & Trace Collector",
        description: "Monitoring agent token usage, session replay, and identifying subagent tool latency bottlenecks.",
        url: "https://agentops.ai",
        category: "Tool",
        tags: "observability, traces, latency",
        author: "Elena Rostova",
        createdById: userElena.id,
      },
      {
        projectId: project.id,
        title: "DeepMind AlphaCode 2 Technical Report",
        description: "Techniques for clustering and reranking candidate agent solutions using dynamic test execution signals.",
        url: "https://storage.googleapis.com/deepmind-media/AlphaCode2/AlphaCode2_Tech_Report.pdf",
        category: "Article",
        tags: "code-gen, search, reranking",
        author: "Abdul",
        createdById: userAbdul.id,
      },
    ],
  });

  // 6. Add Ideas
  await prisma.idea.createMany({
    data: [
      {
        projectId: project.id,
        title: "Hierarchical Planner + Subagent Swarm Architecture",
        description: "Decouple high-level strategic decomposition from granular tool execution workers to prevent context window saturation.",
        contributor: "Abdul",
        tags: "architecture, scaling",
        status: "Accepted",
        createdById: userAbdul.id,
      },
      {
        projectId: project.id,
        title: "Dynamic Few-Shot Reranking from Historical Run Traces",
        description: "Inject 2-3 most similar successful historical execution trajectories into agent system prompts using vector similarity.",
        contributor: "Sarah Chen",
        tags: "rag, performance",
        status: "Discussing",
        createdById: userSarah.id,
      },
      {
        projectId: project.id,
        title: "Dual-Engine Model Routing (Flash for Triage, Pro for Synthesis)",
        description: "Route simple format/classification queries through lightweight fast models to reduce latency by 65%.",
        contributor: "Rahul Verma",
        tags: "cost, latency, routing",
        status: "Accepted",
        createdById: userRahul.id,
      },
      {
        projectId: project.id,
        title: "WASM Sandbox for Client-Side Code Verification",
        description: "Run quick unit tests in-browser before transmitting candidate scripts to cloud sandboxes.",
        contributor: "Elena Rostova",
        tags: "security, wasm, browser",
        status: "New",
        createdById: userElena.id,
      },
      {
        projectId: project.id,
        title: "Automatic Docker Container Rollback via OverlayFS snapshots",
        description: "Revert infected or broken environment states in <50ms without restarting container instances.",
        contributor: "Ahmed Al-Mansoor",
        tags: "infrastructure, sandboxing",
        status: "Implemented",
        createdById: userAhmed.id,
      },
      {
        projectId: project.id,
        title: "Voice-driven Agent Debugger Audio Overlay",
        description: "Unnecessary complexity for hackathon submission deadline; prioritize text terminal logs and trace inspector.",
        contributor: "Elena Rostova",
        tags: "ui, experimental",
        status: "Rejected",
        createdById: userElena.id,
      },
    ],
  });

  // 7. Add Links
  await prisma.link.createMany({
    data: [
      {
        projectId: project.id,
        name: "GitHub Monorepo",
        url: "https://github.com/ragnarok-agentic/ragnarok-core",
        description: "Core agent runtime, sandboxing engine, and prompt registry.",
        category: "GitHub repository",
        createdById: userAbdul.id,
      },
      {
        projectId: project.id,
        name: "Team Discord Server",
        url: "https://discord.gg/ragnarok-team",
        description: "Real-time voice channels and bot alert webhooks.",
        category: "Discord",
        createdById: userSarah.id,
      },
      {
        projectId: project.id,
        name: "Figma UI/UX Mockups",
        url: "https://figma.com/@ragnarok-workspace",
        description: "Linear-style dark dashboard mockups, color tokens, and interaction states.",
        category: "Figma",
        createdById: userElena.id,
      },
      {
        projectId: project.id,
        name: "Staging API Gateway",
        url: "https://api-staging.ragnarok.ai/health",
        description: "Live Kubernetes cluster ingress for benchmark testing.",
        category: "API",
        createdById: userRahul.id,
      },
      {
        projectId: project.id,
        name: "SWE-bench Leaderboard & Datasets",
        url: "https://www.swebench.com",
        description: "Official validation set splits and evaluation ground truths.",
        category: "Dataset",
        createdById: userAhmed.id,
      },
      {
        projectId: project.id,
        name: "Production Demo Endpoint",
        url: "https://demo.ragnarok.ai",
        description: "Public evaluator access with guest credentials.",
        category: "Demo",
        createdById: userAbdul.id,
      },
      {
        projectId: project.id,
        name: "Project Shared Drive",
        url: "https://drive.google.com/drive/folders/ragnarok-shared",
        description: "Slide decks, pitch presentations, and architecture diagrams.",
        category: "Google Drive",
        createdById: userElena.id,
      },
    ],
  });

  // 8. Add Decisions
  await prisma.decision.createMany({
    data: [
      {
        projectId: project.id,
        decision: "Use SQLite with Prisma for zero-friction local development & portability",
        context: "Team needed an immediate working local setup without forcing local PostgreSQL daemon installation across diverse developer OS setups.",
        chosenSolution: "Prisma ORM with SQLite file storage for local development, with clean migration path to PostgreSQL for production deployment.",
        alternativesConsidered: "Local PostgreSQL docker container, Supabase cloud-only, in-memory sqlite.",
        madeBy: "Abdul & Rahul",
        date: new Date(Date.now() - 86400000 * 4),
        createdById: userAbdul.id,
      },
      {
        projectId: project.id,
        decision: "Adopt Model Context Protocol (MCP) as standard tool contract",
        context: "Tool definitions were getting duplicated across subagents with inconsistent JSON schema formatting.",
        chosenSolution: "Standardize on MCP server specifications for all tools (filesystem, git, web search, code sandbox).",
        alternativesConsidered: "Custom OpenAI function calling schemas, LangChain Tool abstract classes.",
        madeBy: "Sarah Chen",
        date: new Date(Date.now() - 86400000 * 3),
        createdById: userSarah.id,
      },
      {
        projectId: project.id,
        decision: "Implement optimistic UI state for instant Kanban and task updates",
        context: "High frequency collaboration resulted in perceivable UI lag during task drags and status changes.",
        chosenSolution: "Optimistic React state updates with background API sync and toast error rollbacks.",
        alternativesConsidered: "Debounced polling, synchronous waiting spinners.",
        madeBy: "Elena Rostova",
        date: new Date(Date.now() - 86400000 * 2),
        createdById: userElena.id,
      },
      {
        projectId: project.id,
        decision: "Limit subagent execution depth to 3 levels to avoid recursion loops",
        context: "Early synthetic benchmark tests showed agents triggering recursive sub-delegation loops consuming excessive API budget.",
        chosenSolution: "Hard cap recursion depth at 3 and fail fast into human-in-the-loop or heuristic fallback.",
        alternativesConsidered: "Dynamic budget token count, timeout-based cancellation.",
        madeBy: "Ahmed Al-Mansoor",
        date: new Date(Date.now() - 86400000 * 1),
        createdById: userAhmed.id,
      },
    ],
  });

  // 9. Add Tasks
  await prisma.task.createMany({
    data: [
      {
        projectId: project.id,
        title: "Setup MCP tool server for Python execution sandbox",
        description: "Deploy isolated Docker container exposing JSON-RPC over stdio.",
        assignee: "Rahul Verma",
        status: "Done",
        priority: "High",
        dueDate: new Date(Date.now() - 86400000),
        order: 1,
        createdById: userRahul.id,
      },
      {
        projectId: project.id,
        title: "Implement self-reflection evaluation prompt harness",
        description: "Generate critique score and targeted revision instructions for failed test runs.",
        assignee: "Sarah Chen",
        status: "In Progress",
        priority: "Urgent",
        dueDate: new Date(Date.now() + 86400000 * 2),
        order: 2,
        createdById: userSarah.id,
      },
      {
        projectId: project.id,
        title: "Create Linear-style dark mode workspace UI",
        description: "Build responsive layout with sidebar navigation, keyboard shortcuts, and clean cards.",
        assignee: "Elena Rostova",
        status: "Done",
        priority: "Medium",
        dueDate: new Date(Date.now() - 86400000 * 2),
        order: 3,
        createdById: userElena.id,
      },
      {
        projectId: project.id,
        title: "Benchmark agent against 50 SWE-bench Lite instances",
        description: "Measure pass@1 accuracy, cost per resolved issue, and average step count.",
        assignee: "Ahmed Al-Mansoor",
        status: "In Progress",
        priority: "High",
        dueDate: new Date(Date.now() + 86400000 * 3),
        order: 4,
        createdById: userAhmed.id,
      },
      {
        projectId: project.id,
        title: "Configure production deployment on Vercel with Cloudflare edge caching",
        description: "Setup staging branch preview URLs and automated database migration hooks.",
        assignee: "Abdul",
        status: "Todo",
        priority: "Medium",
        dueDate: new Date(Date.now() + 86400000 * 4),
        order: 5,
        createdById: userAbdul.id,
      },
      {
        projectId: project.id,
        title: "Record 3-minute video walkthrough for hackathon submission",
        description: "Screen recording showcasing multi-agent coordination and live problem resolution.",
        assignee: "Elena Rostova",
        status: "Backlog",
        priority: "Urgent",
        dueDate: new Date(Date.now() + 86400000 * 5),
        order: 6,
        createdById: userElena.id,
      },
    ],
  });

  // 10. Add Final Executable Workflow
  const workflow = await prisma.workflow.create({
    data: {
      projectId: project.id,
      title: "Final Executable Workflow",
      description:
        "Deterministic, end-to-end execution manual: if a new team member joins right now, they can follow this exact sequence to run and deliver the project.",
    },
  });

  // Step 1: Preparation
  const step1 = await prisma.workflowStep.create({
    data: {
      workflowId: workflow.id,
      title: "1. Preparation",
      description: "Review competition rubric, ensure API keys are provisioned, and clone the monorepo.",
      order: 1,
      isCompleted: true,
    },
  });
  await prisma.workflowStep.createMany({
    data: [
      {
        workflowId: workflow.id,
        parentId: step1.id,
        title: "1.1 Check environment credentials and API tokens",
        description: "Verify GEMINI_API_KEY, ANTHROPIC_API_KEY, and GITHUB_TOKEN are exported in .env",
        assignee: "Abdul",
        notes: "All keys stored in team password manager vault.",
        resources: "https://modelcontextprotocol.io/introduction",
        isCompleted: true,
        order: 1,
      },
      {
        workflowId: workflow.id,
        parentId: step1.id,
        title: "1.2 Validate Docker daemon and Python 3.11+ runtime",
        description: "Run docker info and python --version on host workstation.",
        assignee: "Rahul Verma",
        isCompleted: true,
        order: 2,
      },
    ],
  });

  // Step 2: Setup
  const step2 = await prisma.workflowStep.create({
    data: {
      workflowId: workflow.id,
      title: "2. Setup",
      description: "Initialize local development services, install dependencies, and sync database schema.",
      order: 2,
      isCompleted: true,
    },
  });
  await prisma.workflowStep.createMany({
    data: [
      {
        workflowId: workflow.id,
        parentId: step2.id,
        title: "2.1 Run `npm install` across frontend and backend workspaces",
        description: "Installs React 19, Next.js 15, Prisma 6, and UI components.",
        assignee: "Rahul Verma",
        isCompleted: true,
        order: 1,
      },
      {
        workflowId: workflow.id,
        parentId: step2.id,
        title: "2.2 Initialize SQLite database schema with `npx prisma db push`",
        description: "Synchronizes the models and runs code generator for Prisma Client.",
        assignee: "Abdul",
        isCompleted: true,
        order: 2,
      },
    ],
  });

  // Step 3: Data / Environment
  const step3 = await prisma.workflowStep.create({
    data: {
      workflowId: workflow.id,
      title: "3. Data / Environment",
      description: "Download benchmark validation splits and mount secure execution sandboxes.",
      order: 3,
      isCompleted: false,
    },
  });
  await prisma.workflowStep.createMany({
    data: [
      {
        workflowId: workflow.id,
        parentId: step3.id,
        title: "3.1 Pull SWE-bench Lite dataset into `/benchmark/data`",
        description: "Contains 300 curated Python software engineering issue instances.",
        assignee: "Ahmed Al-Mansoor",
        notes: "Requires at least 12GB of free disk space.",
        resources: "https://www.swebench.com",
        isCompleted: false,
        order: 1,
      },
      {
        workflowId: workflow.id,
        parentId: step3.id,
        title: "3.2 Verify Docker base image `agent-sandbox:v2` builds cleanly",
        description: "Builds ubuntu-based sandbox with pyenv and git preinstalled.",
        assignee: "Rahul Verma",
        isCompleted: true,
        order: 2,
      },
    ],
  });

  // Step 4: Core Implementation
  const step4 = await prisma.workflowStep.create({
    data: {
      workflowId: workflow.id,
      title: "4. Core Implementation",
      description: "Construct the hierarchical state graph, tool execution loop, and reflection pipeline.",
      order: 4,
      isCompleted: false,
    },
  });
  await prisma.workflowStep.createMany({
    data: [
      {
        workflowId: workflow.id,
        parentId: step4.id,
        title: "4.1 Assemble LangGraph hierarchical state machine",
        description: "Define nodes for Planner, Code Investigator, Patch Generator, and Test Verifier.",
        assignee: "Sarah Chen",
        resources: "https://github.com/langchain-ai/langgraph",
        isCompleted: false,
        order: 1,
      },
      {
        workflowId: workflow.id,
        parentId: step4.id,
        title: "4.2 Integrate MCP protocol handlers for filesystem & bash",
        description: "Connect agent runtime to MCP standard tools over JSON-RPC channels.",
        assignee: "Rahul Verma",
        isCompleted: true,
        order: 2,
      },
      {
        workflowId: workflow.id,
        parentId: step4.id,
        title: "4.3 Implement Self-Refine feedback validator loop",
        description: "Intercept unit test stderr and trigger automatic patch re-generation with diff analysis.",
        assignee: "Sarah Chen",
        isCompleted: false,
        order: 3,
      },
    ],
  });

  // Step 5: Integration
  const step5 = await prisma.workflowStep.create({
    data: {
      workflowId: workflow.id,
      title: "5. Integration",
      description: "Connect user interface to real-time agent execution stream via Server-Sent Events.",
      order: 5,
      isCompleted: false,
    },
  });
  await prisma.workflowStep.createMany({
    data: [
      {
        workflowId: workflow.id,
        parentId: step5.id,
        title: "5.1 Wire live task execution telemetry cards into workspace",
        description: "Real-time step badges, token counters, and tool call logs.",
        assignee: "Elena Rostova",
        isCompleted: false,
        order: 1,
      },
      {
        workflowId: workflow.id,
        parentId: step5.id,
        title: "5.2 Add optimistic updates for real-time team collaboration",
        description: "Instant UI feedback when adding resources, ideas, or updating task statuses.",
        assignee: "Elena Rostova",
        isCompleted: true,
        order: 2,
      },
    ],
  });

  // Step 6: Testing
  const step6 = await prisma.workflowStep.create({
    data: {
      workflowId: workflow.id,
      title: "6. Testing",
      description: "Run automated stress tests and verify error recovery mechanisms.",
      order: 6,
      isCompleted: false,
    },
  });
  await prisma.workflowStep.createMany({
    data: [
      {
        workflowId: workflow.id,
        parentId: step6.id,
        title: "6.1 Run synthetic tool failure recovery tests",
        description: "Simulate network timeouts and verify the agent retries with exponential backoff.",
        assignee: "Ahmed Al-Mansoor",
        isCompleted: false,
        order: 1,
      },
      {
        workflowId: workflow.id,
        parentId: step6.id,
        title: "6.2 Verify timeout and token limit backoff policies",
        description: "Ensure agent halts before exceeding 150k token budget per challenge instance.",
        assignee: "Sarah Chen",
        isCompleted: false,
        order: 2,
      },
    ],
  });

  // Step 7: Evaluation
  const step7 = await prisma.workflowStep.create({
    data: {
      workflowId: workflow.id,
      title: "7. Evaluation",
      description: "Execute 50-problem benchmark and compute pass@1 and cost metrics.",
      order: 7,
      isCompleted: false,
    },
  });
  await prisma.workflowStep.createMany({
    data: [
      {
        workflowId: workflow.id,
        parentId: step7.id,
        title: "7.1 Execute 50 problem evaluation run and output JSON report",
        description: "Run batch evaluation pipeline and compile pass rate summary.",
        assignee: "Ahmed Al-Mansoor",
        isCompleted: false,
        order: 1,
      },
      {
        workflowId: workflow.id,
        parentId: step7.id,
        title: "7.2 Generate comparison charts vs baseline GPT-4o standalone",
        description: "Create visual bar chart comparing our multi-agent pass@1 to raw model baseline.",
        assignee: "Ahmed Al-Mansoor",
        isCompleted: false,
        order: 2,
      },
    ],
  });

  // Step 8: Deployment
  const step8 = await prisma.workflowStep.create({
    data: {
      workflowId: workflow.id,
      title: "8. Deployment",
      description: "Deploy production web app and agent execution gateway.",
      order: 8,
      isCompleted: false,
    },
  });
  await prisma.workflowStep.createMany({
    data: [
      {
        workflowId: workflow.id,
        parentId: step8.id,
        title: "8.1 Build production Next.js standalone bundle",
        description: "Run npm run build and verify zero bundle warnings.",
        assignee: "Abdul",
        isCompleted: false,
        order: 1,
      },
      {
        workflowId: workflow.id,
        parentId: step8.id,
        title: "8.2 Point custom domain and verify SSL certificate",
        description: "Configure DNS records on Cloudflare with automated HTTPS renewal.",
        assignee: "Abdul",
        isCompleted: false,
        order: 2,
      },
    ],
  });

  // Step 9: Final Demo
  const step9 = await prisma.workflowStep.create({
    data: {
      workflowId: workflow.id,
      title: "9. Final Demo",
      description: "Deliver live demonstration and submit hackathon project repository.",
      order: 9,
      isCompleted: false,
    },
  });
  await prisma.workflowStep.createMany({
    data: [
      {
        workflowId: workflow.id,
        parentId: step9.id,
        title: "9.1 Conduct rehearsal run solving live bug issue on stage",
        description: "Run live scenario resolving issue sympy/sympy#18198 in under 90 seconds.",
        assignee: "Abdul",
        isCompleted: false,
        order: 1,
      },
      {
        workflowId: workflow.id,
        parentId: step9.id,
        title: "9.2 Submit GitHub repo, README documentation, and demo link",
        description: "Submit final entry before the hackathon countdown deadline.",
        assignee: "Elena Rostova",
        isCompleted: false,
        order: 2,
      },
    ],
  });

  // 11. Add Realistic Activity Feed
  await prisma.activity.createMany({
    data: [
      {
        projectId: project.id,
        user: "Abdul",
        action: "added a resource",
        entityType: "RESOURCE",
        entityTitle: "LangGraph Multi-Agent Workflows & State Graph",
        createdAt: new Date(Date.now() - 1000 * 60 * 12),
      },
      {
        projectId: project.id,
        user: "Sarah Chen",
        action: "added an idea",
        entityType: "IDEA",
        entityTitle: "Dynamic Few-Shot Reranking from Historical Run Traces",
        createdAt: new Date(Date.now() - 1000 * 60 * 45),
      },
      {
        projectId: project.id,
        user: "Rahul Verma",
        action: "updated a task",
        entityType: "TASK",
        entityTitle: "Setup MCP tool server for Python execution sandbox",
        createdAt: new Date(Date.now() - 1000 * 60 * 110),
      },
      {
        projectId: project.id,
        user: "Abdul",
        action: "recorded a decision",
        entityType: "DECISION",
        entityTitle: "Use SQLite with Prisma for zero-friction local development",
        createdAt: new Date(Date.now() - 1000 * 60 * 240),
      },
      {
        projectId: project.id,
        user: "Ahmed Al-Mansoor",
        action: "added a workflow step",
        entityType: "WORKFLOW",
        entityTitle: "7.1 Execute 50 problem evaluation run",
        createdAt: new Date(Date.now() - 1000 * 60 * 360),
      },
      {
        projectId: project.id,
        user: "Elena Rostova",
        action: "added a link",
        entityType: "LINK",
        entityTitle: "Figma UI/UX Mockups",
        createdAt: new Date(Date.now() - 1000 * 60 * 480),
      },
    ],
  });

  console.log("Successfully seeded Ragnarok — Agentic AI Challenge project and all related entities!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
