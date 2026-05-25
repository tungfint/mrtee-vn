import ClassPage from "../class/[slug]/page";
import TeamPage from "../team/[category]/page";

const teamSlugs = new Set(["hsg-tin", "ftc", "ai"]);

export default async function PublicSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (teamSlugs.has(slug)) {
    return <TeamPage params={Promise.resolve({ category: slug })} />;
  }

  return <ClassPage params={Promise.resolve({ slug })} />;
}
