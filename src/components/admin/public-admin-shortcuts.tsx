import { getServerSession } from "next-auth";

import { PublicAdminEditButton } from "@/components/admin/public-admin-edit-button";
import { authOptions } from "@/lib/auth";

export async function PublicAdminShortcuts() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== "ADMIN") {
    return null;
  }

  return <PublicAdminEditButton />;
}

