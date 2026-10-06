import { prisma } from "../db/prisma";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
}

/**
 * Returns current authenticated user or primary default user
 */
export async function getCurrentUser(): Promise<SessionUser> {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    };
  }

  // Fallback demo user if database was just wiped
  return {
    id: "demo-user-id",
    name: "Abdul",
    email: "abdul@project-truth.io",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "OWNER",
  };
}

export async function getAllUsers(): Promise<SessionUser[]> {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    role: u.role,
  }));
}
