import { prisma } from "@/lib/prisma";

export const homeSectionSettingKeys = {
  allImages: "home.section.allImages",
  allPosts: "home.section.allPosts",
  allVideos: "home.section.allVideos",
} as const;

export type HomeSectionSettingKey =
  (typeof homeSectionSettingKeys)[keyof typeof homeSectionSettingKeys];

export type HomeSectionVisibility = {
  allImages: boolean;
  allPosts: boolean;
  allVideos: boolean;
};

const defaultVisibility: HomeSectionVisibility = {
  allImages: true,
  allPosts: true,
  allVideos: true,
};

export async function getHomeSectionVisibility(): Promise<HomeSectionVisibility> {
  const settings = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: Object.values(homeSectionSettingKeys),
      },
    },
  });
  const values = new Map(settings.map((setting) => [setting.key, setting.value]));

  return {
    allImages:
      values.get(homeSectionSettingKeys.allImages) !== "false" &&
      defaultVisibility.allImages,
    allPosts:
      values.get(homeSectionSettingKeys.allPosts) !== "false" &&
      defaultVisibility.allPosts,
    allVideos:
      values.get(homeSectionSettingKeys.allVideos) !== "false" &&
      defaultVisibility.allVideos,
  };
}
