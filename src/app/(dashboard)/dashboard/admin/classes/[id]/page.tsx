import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminClassDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  redirect(`/dashboard/classes/${id}/edit`);
}
