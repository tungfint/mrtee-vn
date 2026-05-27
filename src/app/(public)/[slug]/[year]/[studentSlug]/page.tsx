import { notFound } from "next/navigation";

import StudentProfilePage from "../../../student/[id]/page";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicTeamStudentPage({
  params,
}: {
  params: Promise<{ slug: string; year: string; studentSlug: string }>;
}) {
  const { slug, studentSlug, year } = await params;
  const category = slug.toUpperCase().replace("-", "_");
  const yearNumber = Number(year);

  if (!Number.isInteger(yearNumber)) {
    notFound();
  }

  const studentPage = await prisma.studentPage.findFirst({
    select: { studentProfileId: true },
    where: {
      studentSlug,
      team: {
        category: category as "HSG_TIN" | "FTC" | "AI",
        year: yearNumber,
      },
    },
  });

  if (!studentPage) {
    notFound();
  }

  return <StudentProfilePage params={Promise.resolve({ id: studentPage.studentProfileId })} />;
}
