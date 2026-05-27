import { notFound } from "next/navigation";

import { StudentArticleForm } from "@/components/content/student-article-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function categoryFromSlug(slug: string) {
  if (slug === "hsg-tin") return "HSG_TIN";
  if (slug === "ftc") return "FTC";
  if (slug === "ai") return "AI";
  return null;
}

export default async function TeamStudentArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; year: string; studentSlug: string; token: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { slug, studentSlug, token, year } = await params;
  const query = await searchParams;
  const category = categoryFromSlug(slug);
  const yearNumber = Number(year);

  if (!category || !Number.isInteger(yearNumber)) {
    notFound();
  }

  const studentPage = await prisma.studentPage.findFirst({
    include: {
      studentProfile: { select: { fullName: true } },
      team: { select: { category: true, year: true } },
    },
    where: {
      inputToken: token,
      studentSlug,
      team: {
        category: category as "HSG_TIN" | "FTC" | "AI",
        year: yearNumber,
      },
    },
  });

  if (!studentPage?.team) {
    notFound();
  }

  const publicHref = `/${slug}/${year}/${studentPage.studentSlug}`;

  return (
    <StudentArticleForm
      contextLabel={`Đội tuyển ${slug}/${year}`}
      pageId={studentPage.id}
      publicHref={publicHref}
      saved={query.saved === "1"}
      studentName={studentPage.studentProfile.fullName}
      token={token}
    />
  );
}
