import TeamYearPage from "../../team/[category]/[year]/page";

export default async function PublicTeamYearPage({
  params,
}: {
  params: Promise<{ slug: string; year: string }>;
}) {
  const { slug, year } = await params;

  return <TeamYearPage params={Promise.resolve({ category: slug, year })} />;
}
