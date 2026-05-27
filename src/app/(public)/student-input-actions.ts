"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ContentFormat, MediaType, MemoryPostType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { uploadPublicImage } from "@/lib/uploads";
import { slugifyVietnamese } from "@/lib/slugs";

function optional(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function optionalImage(formData: FormData, key: string) {
  const file = formData.get(`${key}File`);

  if (file instanceof File && file.size > 0) {
    return uploadPublicImage(file);
  }

  return optional(formData, key);
}

function optionalDate(formData: FormData, key: string) {
  const value = optional(formData, key);
  return value ? new Date(value) : null;
}

export async function submitStudentInputAction(formData: FormData) {
  const pageId = optional(formData, "pageId");
  const token = optional(formData, "token");

  if (!pageId || !token) {
    throw new Error("Thiếu token nhập liệu.");
  }

  const studentPage = await prisma.studentPage.findUnique({
    include: {
      class: { select: { slug: true } },
      team: { select: { category: true, year: true } },
    },
    where: { id: pageId },
  });

  if (!studentPage || studentPage.inputToken !== token) {
    throw new Error("Link nhập liệu không hợp lệ.");
  }

  const fullName = optional(formData, "fullName") ?? studentPage.fullNameSnapshot;

  await prisma.studentProfile.update({
    data: {
      avatar: await optionalImage(formData, "avatar"),
      coverImage: await optionalImage(formData, "coverImage"),
      customPhoto1: await optionalImage(formData, "customPhoto1"),
      customPhoto2: await optionalImage(formData, "customPhoto2"),
      dob: optionalDate(formData, "dob"),
      fullName,
      cityCountry: optional(formData, "cityCountry"),
      company: optional(formData, "company"),
      futureGoal: optional(formData, "futureGoal"),
      hobbies: optional(formData, "hobbies"),
      nickname: optional(formData, "nickname"),
      photoWithTeacher: await optionalImage(formData, "photoWithTeacher"),
      postGraduateWork: optional(formData, "postGraduateWork"),
      school: optional(formData, "school"),
      university: optional(formData, "university"),
      workField: optional(formData, "workField"),
      yearbookFormat: (optional(formData, "yearbookFormat") ?? ContentFormat.MARKDOWN) as ContentFormat,
      yearbookMessage: optional(formData, "yearbookMessage"),
    },
    where: { id: studentPage.studentProfileId },
  });

  await prisma.studentPage.update({
    data: { fullNameSnapshot: fullName },
    where: { id: studentPage.id },
  });

  const publicHref =
    studentPage.class?.slug
      ? `/${studentPage.class.slug}/${studentPage.studentSlug}`
      : `/${studentPage.team?.category.toLowerCase().replace("_", "-")}/${studentPage.team?.year}/${studentPage.studentSlug}`;

  revalidatePath(publicHref);
  revalidatePath("/", "layout");
  redirect(`${publicHref}/thongtin/${token}?saved=1`);
}

export async function submitStudentArticleAction(formData: FormData) {
  const pageId = optional(formData, "pageId");
  const token = optional(formData, "token");

  if (!pageId || !token) {
    throw new Error("Thiếu token nhập liệu.");
  }

  const studentPage = await prisma.studentPage.findUnique({
    include: {
      class: { select: { id: true, slug: true } },
      studentProfile: { select: { id: true, fullName: true, userId: true } },
      team: { select: { category: true, id: true, year: true } },
    },
    where: { id: pageId },
  });

  if (!studentPage || studentPage.inputToken !== token) {
    throw new Error("Link nhập bài viết không hợp lệ.");
  }

  const title = optional(formData, "title") ?? `Bài viết của ${studentPage.studentProfile.fullName}`;
  const content = optional(formData, "content") ?? "";
  const attachmentUrl = optional(formData, "attachmentUrl");
  const slugBase = slugifyVietnamese(`${studentPage.studentSlug}-${title}`) || studentPage.studentSlug;
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  const post = await prisma.memoryPost.create({
    data: {
      authorId: studentPage.studentProfile.userId,
      classId: studentPage.class?.id,
      content,
      contentFormat: (optional(formData, "contentFormat") ?? ContentFormat.MARKDOWN) as ContentFormat,
      coverImage: await optionalImage(formData, "coverImage"),
      excerpt: optional(formData, "excerpt"),
      publishedAt: new Date(),
      showOnHome: false,
      slug,
      studentProfileId: studentPage.studentProfile.id,
      teamId: studentPage.team?.id,
      title,
      type: MemoryPostType.STUDENT_YEARBOOK,
    },
  });

  if (attachmentUrl) {
    await prisma.mediaAsset.create({
      data: {
        memoryPostId: post.id,
        title: optional(formData, "attachmentTitle") ?? "Link bài viết",
        type: MediaType.LINK,
        url: attachmentUrl,
      },
    });
  }

  const publicHref =
    studentPage.class?.slug
      ? `/${studentPage.class.slug}/${studentPage.studentSlug}`
      : `/${studentPage.team?.category.toLowerCase().replace("_", "-")}/${studentPage.team?.year}/${studentPage.studentSlug}`;

  revalidatePath(publicHref);
  revalidatePath("/", "layout");
  redirect(`${publicHref}/baiviet/${token}?saved=1`);
}
