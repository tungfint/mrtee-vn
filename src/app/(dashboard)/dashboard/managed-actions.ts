"use server";

import {
  ContentFormat,
  MediaType,
  MemoryPostType,
  Role,
  TeamCategory,
} from "@prisma/client";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { canEditClass, canEditTeam } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { uploadPublicImage, uploadPublicMedia } from "@/lib/uploads";

function required(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing required field: ${key}`);
  }

  return value.trim();
}

function optional(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return value.trim();
}

function optionalClassId(formData: FormData) {
  const classId = optional(formData, "classId");
  return classId === "none" ? null : classId;
}

function optionalStudentProfileId(formData: FormData) {
  const studentProfileId = optional(formData, "studentProfileId");
  return studentProfileId === "none" ? null : studentProfileId;
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

function optionalPublishedAt(formData: FormData) {
  if (formData.get("published") !== "on") {
    return null;
  }

  return new Date();
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function defaultSlug(value: string) {
  return `${slugify(value)}-${Date.now().toString(36)}`;
}

function classMemoryPostType(formData: FormData) {
  const type = required(formData, "type") as MemoryPostType;

  return type === MemoryPostType.CLASS_INTRO
    ? MemoryPostType.CLASS_INTRO
    : MemoryPostType.CLASS_STORY;
}

function mediaTypeFromFile(file: File) {
  if (file.type.startsWith("image/")) {
    return MediaType.IMAGE;
  }

  if (file.type.startsWith("video/")) {
    return MediaType.VIDEO;
  }

  return MediaType.AUDIO;
}

function parsedMediaLines(formData: FormData, key = "mediaLines") {
  const value = optional(formData, key) ?? "";
  const allowed = new Set(Object.values(MediaType));

  return value
    .split("\n")
    .map((line) => line.split("|").map((valuePart) => valuePart.trim()))
    .filter((parts) => parts.length >= 2 && allowed.has(parts[0] as MediaType) && parts[1])
    .map(([type, url, title, caption]) => ({
      caption: caption || null,
      title: title || null,
      type: type as MediaType,
      url,
    }));
}

async function replaceMediaAssets(memoryPostId: string, formData: FormData) {
  const media = parsedMediaLines(formData);

  for (const value of formData.getAll("mediaFiles")) {
    if (value instanceof File && value.size > 0) {
      const url = await uploadPublicMedia(value);

      if (url) {
        media.push({
          caption: null,
          title: value.name,
          type: mediaTypeFromFile(value),
          url,
        });
      }
    }
  }

  await prisma.mediaAsset.deleteMany({ where: { memoryPostId } });

  if (media.length) {
    await prisma.mediaAsset.createMany({
      data: media.map((item, sortOrder) => ({
        ...item,
        memoryPostId,
        sortOrder,
      })),
    });
  }
}

async function replaceAlbumItems(albumId: string, formData: FormData) {
  const separatedItems = [
    ...parsedMediaLines(formData, "albumImages"),
    ...parsedMediaLines(formData, "albumVideos"),
    ...parsedMediaLines(formData, "albumExtras"),
  ];
  const items = separatedItems.length
    ? separatedItems
    : parsedMediaLines(formData, "albumItems");

  await prisma.albumItem.deleteMany({ where: { albumId } });

  if (items.length) {
    await prisma.albumItem.createMany({
      data: items.map((item, sortOrder) => ({
        ...item,
        albumId,
        sortOrder,
      })),
    });
  }
}

function optionalPlaylistId(formData: FormData) {
  const playlistId = optional(formData, "playlistId");
  return playlistId === "none" ? null : playlistId;
}

function feedbackUrl(path: string, status: "success" | "error", message: string) {
  return `${path}?status=${status}&message=${encodeURIComponent(message)}&feedback=${Date.now()}`;
}

function actionFailed(path: string, message: string, error?: unknown): never {
  if (error) {
    console.error(error);
  }

  redirect(feedbackUrl(path, "error", message));
}

function actionCompleted(path: string, message: string): never {
  revalidatePath(path);
  revalidatePath("/", "layout");
  redirect(feedbackUrl(path, "success", message));
}

async function requireDashboardUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return session;
}

async function requireClassEditor(classId: string) {
  const session = await requireDashboardUser();
  const classroom = await prisma.class.findUnique({
    select: { id: true, monitorId: true, slug: true },
    where: { id: classId },
  });

  if (!classroom || !canEditClass(session.user, classroom)) {
    redirect("/dashboard");
  }

  return { classroom, session };
}

async function requireTeamEditor(teamId: string) {
  const session = await requireDashboardUser();
  const team = await prisma.team.findUnique({
    select: { id: true, monitorId: true },
    where: { id: teamId },
  });

  if (!team || !canEditTeam(session.user, team)) {
    redirect("/dashboard");
  }

  return { session, team };
}

export async function updateManagedClassAction(formData: FormData) {
  const classId = required(formData, "classId");
  await requireClassEditor(classId);
  const path = `/dashboard/classes/${classId}/edit`;

  const name = required(formData, "name");

  try {
    await prisma.class.update({
      data: {
        achievements: optional(formData, "achievements"),
        cardBackgroundImage: await optionalImage(formData, "cardBackgroundImage"),
        cardBackgroundImageCrop: optional(formData, "cardBackgroundImageCrop"),
        coverImage: await optionalImage(formData, "coverImage"),
        coverImageCrop: optional(formData, "coverImageCrop"),
        externalMediaUrl: optional(formData, "externalMediaUrl"),
        introduction: optional(formData, "introduction"),
        name,
        slug: optional(formData, "slug") ?? slugify(name),
        slogan: optional(formData, "slogan"),
      },
      where: { id: classId },
    });
  } catch (error) {
    actionFailed(path, "Không thể lưu thông tin lớp. Hãy kiểm tra ảnh và dữ liệu nhập.", error);
  }

  actionCompleted(path, "Đã lưu thông tin lớp thành công.");
}

export async function createManagedClassStudentAction(formData: FormData) {
  const classId = required(formData, "classId");
  await requireClassEditor(classId);
  const path = `/dashboard/classes/${classId}/edit`;

  const fullName = required(formData, "fullName");
  const email = required(formData, "email").toLowerCase();
  const password = optional(formData, "password") ?? "Mrtee@2026";

  try {
    await prisma.user.create({
      data: {
        classId,
        email,
        name: fullName,
        passwordHash: await hash(password, 12),
        role: Role.STUDENT,
        profile: {
          create: {
            avatar: await optionalImage(formData, "avatar"),
            coverImage: await optionalImage(formData, "coverImage"),
            fullName,
            nickname: optional(formData, "nickname"),
            school: optional(formData, "school"),
          },
        },
      },
    });
  } catch (error) {
    actionFailed(path, "Không thể thêm thành viên. Email có thể đã tồn tại.", error);
  }

  actionCompleted(path, "Đã thêm thành viên vào lớp.");
}

export async function updateManagedClassStudentAction(formData: FormData) {
  const classId = required(formData, "classId");
  await requireClassEditor(classId);
  const path = `/dashboard/classes/${classId}/edit`;

  const userId = required(formData, "userId");
  const fullName = required(formData, "fullName");
  const targetUser = await prisma.user.findUnique({
    select: { classId: true },
    where: { id: userId },
  });

  if (targetUser?.classId !== classId) {
    actionFailed(path, "Thành viên này không còn thuộc lớp.");
  }

  try {
    await prisma.user.update({
    data: {
      email: required(formData, "email").toLowerCase(),
      name: fullName,
      profile: {
        upsert: {
          create: {
            avatar: await optionalImage(formData, "avatar"),
            avatarCrop: optional(formData, "avatarCrop"),
            customPhoto1: await optionalImage(formData, "customPhoto1"),
            customPhoto1Crop: optional(formData, "customPhoto1Crop"),
            customPhoto2: await optionalImage(formData, "customPhoto2"),
            customPhoto2Crop: optional(formData, "customPhoto2Crop"),
            coverImage: await optionalImage(formData, "coverImage"),
            coverImageCrop: optional(formData, "coverImageCrop"),
            dob: optionalDate(formData, "dob"),
            fullName,
            futureGoal: optional(formData, "futureGoal"),
            hobbies: optional(formData, "hobbies"),
            nickname: optional(formData, "nickname"),
            photoWithTeacher: await optionalImage(formData, "photoWithTeacher"),
            photoWithTeacherCrop: optional(formData, "photoWithTeacherCrop"),
            postGraduateWork: optional(formData, "postGraduateWork"),
            school: optional(formData, "school"),
            university: optional(formData, "university"),
            yearbookMessage: optional(formData, "yearbookMessage"),
          },
          update: {
            avatar: await optionalImage(formData, "avatar"),
            avatarCrop: optional(formData, "avatarCrop"),
            customPhoto1: await optionalImage(formData, "customPhoto1"),
            customPhoto1Crop: optional(formData, "customPhoto1Crop"),
            customPhoto2: await optionalImage(formData, "customPhoto2"),
            customPhoto2Crop: optional(formData, "customPhoto2Crop"),
            coverImage: await optionalImage(formData, "coverImage"),
            coverImageCrop: optional(formData, "coverImageCrop"),
            dob: optionalDate(formData, "dob"),
            fullName,
            futureGoal: optional(formData, "futureGoal"),
            hobbies: optional(formData, "hobbies"),
            nickname: optional(formData, "nickname"),
            photoWithTeacher: await optionalImage(formData, "photoWithTeacher"),
            photoWithTeacherCrop: optional(formData, "photoWithTeacherCrop"),
            postGraduateWork: optional(formData, "postGraduateWork"),
            school: optional(formData, "school"),
            university: optional(formData, "university"),
            yearbookMessage: optional(formData, "yearbookMessage"),
          },
        },
      },
    },
    where: { id: userId },
    });
  } catch (error) {
    actionFailed(path, "Không thể lưu thành viên. Hãy kiểm tra ảnh và dữ liệu nhập.", error);
  }

  actionCompleted(path, "Đã lưu thông tin thành viên.");
}

export async function createManagedClassPostAction(formData: FormData) {
  const classId = required(formData, "classId");
  const { session } = await requireClassEditor(classId);
  const path = `/dashboard/classes/${classId}/edit`;
  const title = required(formData, "title");

  try {
    const post = await prisma.memoryPost.create({
    data: {
      authorId: session.user.id,
      backgroundImage: await optionalImage(formData, "backgroundImage"),
      backgroundImageCrop: optional(formData, "backgroundImageCrop"),
      classId,
      content: required(formData, "content"),
      contentFormat: required(formData, "contentFormat") as ContentFormat,
      coverImage: await optionalImage(formData, "coverImage"),
      coverImageCrop: optional(formData, "coverImageCrop"),
      excerpt: optional(formData, "excerpt"),
      publishedAt: optionalPublishedAt(formData),
      slug: optional(formData, "slug") ?? defaultSlug(title),
      studentProfileId: optionalStudentProfileId(formData),
      title,
      type: classMemoryPostType(formData),
    },
    });
    await replaceMediaAssets(post.id, formData);
  } catch (error) {
    actionFailed(path, "Không thể tạo bài viết. Hãy kiểm tra ảnh hoặc slug.", error);
  }

  actionCompleted(path, "Đã tạo bài viết mới.");
}

export async function updateManagedClassPostAction(formData: FormData) {
  const classId = required(formData, "classId");
  await requireClassEditor(classId);
  const path = `/dashboard/classes/${classId}/edit`;
  const title = required(formData, "title");

  try {
    await prisma.memoryPost.updateMany({
    data: {
      backgroundImage: await optionalImage(formData, "backgroundImage"),
      backgroundImageCrop: optional(formData, "backgroundImageCrop"),
      content: required(formData, "content"),
      contentFormat: required(formData, "contentFormat") as ContentFormat,
      coverImage: await optionalImage(formData, "coverImage"),
      coverImageCrop: optional(formData, "coverImageCrop"),
      excerpt: optional(formData, "excerpt"),
      publishedAt: optionalPublishedAt(formData),
      slug: optional(formData, "slug") ?? defaultSlug(title),
      studentProfileId: optionalStudentProfileId(formData),
      title,
      type: classMemoryPostType(formData),
    },
    where: { classId, id: required(formData, "postId") },
    });
    await replaceMediaAssets(required(formData, "postId"), formData);
  } catch (error) {
    actionFailed(path, "Không thể lưu bài viết. Hãy kiểm tra ảnh hoặc slug.", error);
  }

  actionCompleted(path, "Đã lưu bài viết.");
}

export async function deleteManagedClassPostAction(formData: FormData) {
  const classId = required(formData, "classId");
  await requireClassEditor(classId);
  const path = `/dashboard/classes/${classId}/edit`;

  try {
    await prisma.memoryPost.deleteMany({
      where: { classId, id: required(formData, "postId") },
    });
  } catch (error) {
    actionFailed(path, "Không thể xóa bài viết.", error);
  }

  actionCompleted(path, "Đã xóa bài viết.");
}

export async function createManagedClassAlbumAction(formData: FormData) {
  const classId = required(formData, "classId");
  await requireClassEditor(classId);
  const path = `/dashboard/classes/${classId}/edit`;

  try {
    const album = await prisma.album.create({
      data: {
        classId,
        description: optional(formData, "description"),
        imageFolderUrl: optional(formData, "imageFolderUrl"),
        playlistId: optionalPlaylistId(formData),
        published: formData.get("published") === "on",
        sortOrder: Number(optional(formData, "sortOrder") ?? "0"),
        title: required(formData, "title"),
        videoFolderUrl: optional(formData, "videoFolderUrl"),
      },
    });
    await replaceAlbumItems(album.id, formData);
  } catch (error) {
    actionFailed(path, "Không thể tạo album lớp.", error);
  }

  actionCompleted(path, "Đã tạo album lớp.");
}

export async function updateManagedClassAlbumAction(formData: FormData) {
  const classId = required(formData, "classId");
  await requireClassEditor(classId);
  const path = `/dashboard/classes/${classId}/edit`;
  const albumId = required(formData, "albumId");

  try {
    const result = await prisma.album.updateMany({
      data: {
        description: optional(formData, "description"),
        imageFolderUrl: optional(formData, "imageFolderUrl"),
        playlistId: optionalPlaylistId(formData),
        published: formData.get("published") === "on",
        sortOrder: Number(optional(formData, "sortOrder") ?? "0"),
        title: required(formData, "title"),
        videoFolderUrl: optional(formData, "videoFolderUrl"),
      },
      where: { classId, id: albumId },
    });

    if (!result.count) {
      actionFailed(path, "Album này không còn thuộc lớp.");
    }

    await replaceAlbumItems(albumId, formData);
  } catch (error) {
    actionFailed(path, "Không thể lưu album lớp.", error);
  }

  actionCompleted(path, "Đã lưu album lớp.");
}

export async function deleteManagedClassAlbumAction(formData: FormData) {
  const classId = required(formData, "classId");
  await requireClassEditor(classId);
  const path = `/dashboard/classes/${classId}/edit`;

  try {
    await prisma.album.deleteMany({
      where: { classId, id: required(formData, "albumId") },
    });
  } catch (error) {
    actionFailed(path, "Không thể xóa album lớp.", error);
  }

  actionCompleted(path, "Đã xóa album lớp.");
}

export async function removeManagedClassStudentAction(formData: FormData) {
  const classId = required(formData, "classId");
  await requireClassEditor(classId);
  const path = `/dashboard/classes/${classId}/edit`;

  try {
    await prisma.user.updateMany({
      data: { classId: null },
      where: { classId, id: required(formData, "userId") },
    });
  } catch (error) {
    actionFailed(path, "Không thể xóa thành viên khỏi lớp.", error);
  }

  actionCompleted(path, "Đã xóa thành viên khỏi lớp. Hồ sơ vẫn được giữ lại.");
}

export async function updateManagedTeamAction(formData: FormData) {
  const teamId = required(formData, "teamId");
  await requireTeamEditor(teamId);
  const path = `/dashboard/teams/${teamId}/edit`;

  try {
    await prisma.team.update({
    data: {
      achievements: optional(formData, "achievements"),
      backgroundImage: await optionalImage(formData, "backgroundImage"),
      backgroundImageCrop: optional(formData, "backgroundImageCrop"),
      cardBackgroundImage: await optionalImage(formData, "cardBackgroundImage"),
      cardBackgroundImageCrop: optional(formData, "cardBackgroundImageCrop"),
      category: required(formData, "category") as TeamCategory,
      coverImage: await optionalImage(formData, "coverImage"),
      coverImageCrop: optional(formData, "coverImageCrop"),
      description: optional(formData, "description"),
      galleryImages: (optional(formData, "galleryImages") ?? "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      introContent: optional(formData, "introContent"),
      introFormat: required(formData, "introFormat") as ContentFormat,
      year: Number(required(formData, "year")),
    },
    where: { id: teamId },
    });
  } catch (error) {
    actionFailed(path, "Không thể lưu thông tin đội tuyển. Hãy kiểm tra ảnh và dữ liệu nhập.", error);
  }

  actionCompleted(path, "Đã lưu thông tin đội tuyển.");
}

export async function addManagedTeamMemberAction(formData: FormData) {
  const teamId = required(formData, "teamId");
  await requireTeamEditor(teamId);
  const path = `/dashboard/teams/${teamId}/edit`;

  try {
    await prisma.teamMember.upsert({
    create: {
      role: optional(formData, "role"),
      studentProfileId: required(formData, "studentProfileId"),
      teamId,
    },
    update: {
      role: optional(formData, "role"),
    },
    where: {
      teamId_studentProfileId: {
        studentProfileId: required(formData, "studentProfileId"),
        teamId,
      },
    },
    });
  } catch (error) {
    actionFailed(path, "Không thể thêm thành viên vào đội.", error);
  }

  actionCompleted(path, "Đã thêm thành viên vào đội tuyển.");
}

export async function updateManagedTeamMemberAction(formData: FormData) {
  const teamId = required(formData, "teamId");
  const { session } = await requireTeamEditor(teamId);
  const path = `/dashboard/teams/${teamId}/edit`;

  const memberId = required(formData, "memberId");
  const fullName = required(formData, "fullName");
  const member = await prisma.teamMember.findFirst({
    include: {
      studentProfile: { select: { userId: true } },
    },
    where: { id: memberId, teamId },
  });

  if (!member) {
    actionFailed(path, "Thành viên này không còn thuộc đội.");
  }

  try {
    await prisma.teamMember.update({
      data: { role: optional(formData, "memberRole") },
      where: { id: memberId },
    });

    await prisma.user.update({
    data: {
      ...(session.user.role === Role.ADMIN
        ? { classId: optionalClassId(formData) }
        : {}),
      email: required(formData, "email").toLowerCase(),
      name: fullName,
      profile: {
        update: {
          avatar: await optionalImage(formData, "avatar"),
          avatarCrop: optional(formData, "avatarCrop"),
          customPhoto1: await optionalImage(formData, "customPhoto1"),
          customPhoto1Crop: optional(formData, "customPhoto1Crop"),
          customPhoto2: await optionalImage(formData, "customPhoto2"),
          customPhoto2Crop: optional(formData, "customPhoto2Crop"),
          coverImage: await optionalImage(formData, "coverImage"),
          coverImageCrop: optional(formData, "coverImageCrop"),
          dob: optionalDate(formData, "dob"),
          fullName,
          futureGoal: optional(formData, "futureGoal"),
          hobbies: optional(formData, "hobbies"),
          nickname: optional(formData, "nickname"),
          photoWithTeacher: await optionalImage(formData, "photoWithTeacher"),
          photoWithTeacherCrop: optional(formData, "photoWithTeacherCrop"),
          postGraduateWork: optional(formData, "postGraduateWork"),
          school: optional(formData, "school"),
          university: optional(formData, "university"),
          yearbookMessage: optional(formData, "yearbookMessage"),
        },
      },
    },
    where: { id: member.studentProfile.userId },
    });
  } catch (error) {
    actionFailed(path, "Không thể lưu thành viên đội tuyển. Hãy kiểm tra ảnh và dữ liệu nhập.", error);
  }

  actionCompleted(path, "Đã lưu thông tin thành viên đội tuyển.");
}

export async function removeManagedTeamMemberAction(formData: FormData) {
  const teamId = required(formData, "teamId");
  await requireTeamEditor(teamId);
  const path = `/dashboard/teams/${teamId}/edit`;

  try {
    await prisma.teamMember.deleteMany({
      where: { id: required(formData, "memberId"), teamId },
    });
  } catch (error) {
    actionFailed(path, "Không thể xóa thành viên khỏi đội.", error);
  }

  actionCompleted(path, "Đã xóa thành viên khỏi đội. Hồ sơ vẫn được giữ lại.");
}

export async function createManagedTeamPostAction(formData: FormData) {
  const teamId = required(formData, "teamId");
  const { session } = await requireTeamEditor(teamId);
  const path = `/dashboard/teams/${teamId}/edit`;
  const title = required(formData, "title");

  try {
    const post = await prisma.memoryPost.create({
    data: {
      authorId: session.user.id,
      backgroundImage: await optionalImage(formData, "backgroundImage"),
      backgroundImageCrop: optional(formData, "backgroundImageCrop"),
      content: required(formData, "content"),
      contentFormat: required(formData, "contentFormat") as ContentFormat,
      coverImage: await optionalImage(formData, "coverImage"),
      coverImageCrop: optional(formData, "coverImageCrop"),
      excerpt: optional(formData, "excerpt"),
      publishedAt: optionalPublishedAt(formData),
      slug: optional(formData, "slug") ?? defaultSlug(title),
      studentProfileId: optionalStudentProfileId(formData),
      teamId,
      title,
      type: MemoryPostType.TEAM_STORY,
    },
    });
    await replaceMediaAssets(post.id, formData);
  } catch (error) {
    actionFailed(path, "Không thể tạo bài viết đội tuyển. Hãy kiểm tra ảnh hoặc slug.", error);
  }

  actionCompleted(path, "Đã tạo bài viết đội tuyển.");
}

export async function updateManagedTeamPostAction(formData: FormData) {
  const teamId = required(formData, "teamId");
  await requireTeamEditor(teamId);
  const path = `/dashboard/teams/${teamId}/edit`;
  const title = required(formData, "title");

  try {
    await prisma.memoryPost.updateMany({
    data: {
      backgroundImage: await optionalImage(formData, "backgroundImage"),
      backgroundImageCrop: optional(formData, "backgroundImageCrop"),
      content: required(formData, "content"),
      contentFormat: required(formData, "contentFormat") as ContentFormat,
      coverImage: await optionalImage(formData, "coverImage"),
      coverImageCrop: optional(formData, "coverImageCrop"),
      excerpt: optional(formData, "excerpt"),
      publishedAt: optionalPublishedAt(formData),
      slug: optional(formData, "slug") ?? defaultSlug(title),
      studentProfileId: optionalStudentProfileId(formData),
      title,
    },
    where: { id: required(formData, "postId"), teamId },
    });
    await replaceMediaAssets(required(formData, "postId"), formData);
  } catch (error) {
    actionFailed(path, "Không thể lưu bài viết đội tuyển. Hãy kiểm tra ảnh hoặc slug.", error);
  }

  actionCompleted(path, "Đã lưu bài viết đội tuyển.");
}

export async function deleteManagedTeamPostAction(formData: FormData) {
  const teamId = required(formData, "teamId");
  await requireTeamEditor(teamId);
  const path = `/dashboard/teams/${teamId}/edit`;

  try {
    await prisma.memoryPost.deleteMany({
      where: { id: required(formData, "postId"), teamId },
    });
  } catch (error) {
    actionFailed(path, "Không thể xóa bài viết đội tuyển.", error);
  }

  actionCompleted(path, "Đã xóa bài viết đội tuyển.");
}

export async function createManagedTeamAlbumAction(formData: FormData) {
  const teamId = required(formData, "teamId");
  await requireTeamEditor(teamId);
  const path = `/dashboard/teams/${teamId}/edit`;

  try {
    const album = await prisma.album.create({
      data: {
        description: optional(formData, "description"),
        imageFolderUrl: optional(formData, "imageFolderUrl"),
        playlistId: optionalPlaylistId(formData),
        published: formData.get("published") === "on",
        sortOrder: Number(optional(formData, "sortOrder") ?? "0"),
        teamId,
        title: required(formData, "title"),
        videoFolderUrl: optional(formData, "videoFolderUrl"),
      },
    });
    await replaceAlbumItems(album.id, formData);
  } catch (error) {
    actionFailed(path, "Không thể tạo album đội tuyển.", error);
  }

  actionCompleted(path, "Đã tạo album đội tuyển.");
}

export async function updateManagedTeamAlbumAction(formData: FormData) {
  const teamId = required(formData, "teamId");
  await requireTeamEditor(teamId);
  const path = `/dashboard/teams/${teamId}/edit`;
  const albumId = required(formData, "albumId");

  try {
    const result = await prisma.album.updateMany({
      data: {
        description: optional(formData, "description"),
        imageFolderUrl: optional(formData, "imageFolderUrl"),
        playlistId: optionalPlaylistId(formData),
        published: formData.get("published") === "on",
        sortOrder: Number(optional(formData, "sortOrder") ?? "0"),
        title: required(formData, "title"),
        videoFolderUrl: optional(formData, "videoFolderUrl"),
      },
      where: { id: albumId, teamId },
    });

    if (!result.count) {
      actionFailed(path, "Album này không còn thuộc đội tuyển.");
    }

    await replaceAlbumItems(albumId, formData);
  } catch (error) {
    actionFailed(path, "Không thể lưu album đội tuyển.", error);
  }

  actionCompleted(path, "Đã lưu album đội tuyển.");
}

export async function deleteManagedTeamAlbumAction(formData: FormData) {
  const teamId = required(formData, "teamId");
  await requireTeamEditor(teamId);
  const path = `/dashboard/teams/${teamId}/edit`;

  try {
    await prisma.album.deleteMany({
      where: { id: required(formData, "albumId"), teamId },
    });
  } catch (error) {
    actionFailed(path, "Không thể xóa album đội tuyển.", error);
  }

  actionCompleted(path, "Đã xóa album đội tuyển.");
}
