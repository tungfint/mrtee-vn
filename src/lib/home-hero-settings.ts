import { prisma } from "@/lib/prisma";
import { defaultHomeHeroSlides, type HomeHeroSlide } from "@/lib/home-hero-slides";

export const homeHeroSlidesSettingKey = "home.hero.slides";

function normalizeSlides(value: unknown): HomeHeroSlide[] {
  if (!Array.isArray(value)) return [];

  const slides: HomeHeroSlide[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;

    const candidate = item as Partial<HomeHeroSlide>;
    const image = typeof candidate.image === "string" ? candidate.image.trim() : "";
    const caption = typeof candidate.caption === "string" ? candidate.caption.trim() : "";
    const imageCrop =
      typeof candidate.imageCrop === "string" && candidate.imageCrop.trim()
        ? candidate.imageCrop.trim()
        : "50% 50%";

    if (!image) continue;

    slides.push({
      caption,
      image,
      imageCrop,
    });
  }

  return slides;
}

export async function getHomeHeroSlides() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: homeHeroSlidesSettingKey },
  });

  if (!setting?.value) return defaultHomeHeroSlides;

  try {
    const slides = normalizeSlides(JSON.parse(setting.value));
    return slides.length ? slides : defaultHomeHeroSlides;
  } catch {
    return defaultHomeHeroSlides;
  }
}

export async function setHomeHeroSlides(slides: HomeHeroSlide[]) {
  await prisma.siteSetting.upsert({
    create: {
      key: homeHeroSlidesSettingKey,
      value: JSON.stringify(normalizeSlides(slides)),
    },
    update: {
      value: JSON.stringify(normalizeSlides(slides)),
    },
    where: { key: homeHeroSlidesSettingKey },
  });
}
