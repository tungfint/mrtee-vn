import TeamYearPage from "../../team/[category]/[year]/page";
import StudentProfilePage from "../../student/[id]/page";
import { prisma } from "@/lib/prisma";

export default async function PublicTeamYearPage({
  params,
}: {
  params: Promise<{ slug: string; year: string }>;
}) {
  const { slug, year } = await params;

  if (!/^\d{4}$/.test(year)) {
    const studentPage = await prisma.studentPage.findFirst({
      select: { studentProfileId: true },
      where: {
        class: { slug },
        studentSlug: year,
      },
    });

    if (studentPage) {
      return <StudentProfilePage params={Promise.resolve({ id: studentPage.studentProfileId })} />;
    }
  }

  return <TeamYearPage params={Promise.resolve({ category: slug, year })} />;
}
