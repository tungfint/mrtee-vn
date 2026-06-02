import { prisma } from "@/lib/prisma";
import { looksLikeEmailDerivedSlug, studentSlugFromName } from "@/lib/slugs";

export async function classStudentSlugRedirect(
  classSlug: string,
  requestedSlug: string,
  inputToken?: string,
) {
  if (!looksLikeEmailDerivedSlug(requestedSlug)) {
    return null;
  }

  const pages = await prisma.studentPage.findMany({
    select: {
      studentSlug: true,
      studentProfile: { select: { fullName: true } },
    },
    where: {
      class: { slug: classSlug },
      inputToken,
    },
  });

  return (
    pages.find((page) => {
      const nameSlug = studentSlugFromName(page.studentProfile.fullName);

      return nameSlug && requestedSlug.startsWith(nameSlug) && page.studentSlug !== requestedSlug;
    })?.studentSlug ?? null
  );
}
