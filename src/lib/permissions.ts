import type { Role } from "@prisma/client";

type SessionUser = {
  id: string;
  role: Role;
  classId?: string | null;
};

export function isAdmin(user?: SessionUser | null) {
  return user?.role === "ADMIN";
}

export function canEditClass(
  user: SessionUser | null | undefined,
  targetClass: { id: string; monitorId?: string | null },
) {
  return (
    user?.role === "ADMIN" ||
    (user?.role === "MONITOR" && targetClass.monitorId === user.id)
  );
}

export function canEditStudentProfile(
  user: SessionUser | null | undefined,
  profile: { userId: string },
) {
  return user?.role === "ADMIN" || user?.id === profile.userId;
}

export function canManageTeams(user?: SessionUser | null) {
  return user?.role === "ADMIN";
}

export function canManageBlog(user?: SessionUser | null) {
  return user?.role === "ADMIN";
}
