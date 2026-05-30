"use server";

import {
  AlbumViewMode,
  ContentFormat,
  MemoryPostType,
  Role,
  StudentPageScope,
  TeamCategory,
} from "@prisma/client";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin-auth";
import { getHomeHeroSlides, setHomeHeroSlides } from "@/lib/home-hero-settings";
import { homeSectionSettingKeys } from "@/lib/home-section-settings";
import { prisma } from "@/lib/prisma";
import { slugifyVietnamese, studentEmailFromSlug } from "@/lib/slugs";
import { uploadPublicImage } from "@/lib/uploads";

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

async function optionalImage(formData: FormData, key: string) {
  const file = formData.get(`${key}File`);

  if (file instanceof File && file.size > 0) {
    return uploadPublicImage(file);
  }

  return optional(formData, key);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function studentPageToken() {
  return randomBytes(24).toString("base64url");
}

function parseStudentImportLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, secondPart, thirdPart] = line.split("|").map((part) => part.trim());
      const secondPartIsEmail = Boolean(secondPart?.includes("@"));
      const email = (secondPartIsEmail ? secondPart : thirdPart)?.toLowerCase() || null;
      const slugPart = secondPartIsEmail ? null : secondPart;

      return {
        email,
        fullName: namePart,
        slug: slugPart ? slugifyVietnamese(slugPart) : slugifyVietnamese(namePart),
      };
    })
    .filter((item) => item.fullName && item.slug);
}

async function uniqueStudentSlug({
  baseSlug,
  classId,
  excludeId,
  scope,
  teamId,
}: {
  baseSlug: string;
  classId?: string | null;
  excludeId?: string | null;
  scope?: StudentPageScope;
  teamId?: string | null;
}) {
  let candidate = baseSlug;
  let suffix = 0;

  while (
    await prisma.studentPage.findFirst({
      select: { id: true },
      where:
        scope === StudentPageScope.INDEPENDENT
          ? { id: excludeId ? { not: excludeId } : undefined, scope: StudentPageScope.INDEPENDENT, studentSlug: candidate }
          : classId
            ? { classId, id: excludeId ? { not: excludeId } : undefined, studentSlug: candidate }
            : { id: excludeId ? { not: excludeId } : undefined, teamId, studentSlug: candidate },
    })
  ) {
    suffix += 1;
    candidate = `${baseSlug}${suffix}`;
  }

  return candidate;
}

function defaultSlug(value: string) {
  return `${slugify(value)}-${Date.now().toString(36)}`;
}

function optionalDate(formData: FormData, key: string) {
  const value = optional(formData, key);
  return value ? new Date(value) : null;
}

function optionalPublishedAt(formData: FormData) {
  if (formData.get("published") !== "on") {
    return null;
  }

  return optionalDate(formData, "publishedAt") ?? new Date();
}

function optionalClassId(formData: FormData) {
  const classId = optional(formData, "classId");
  return classId === "none" ? null : classId;
}

function optionalTeamId(formData: FormData) {
  const teamId = optional(formData, "teamId");
  return teamId === "none" ? null : teamId;
}

function optionalStudentProfileId(formData: FormData) {
  const studentProfileId = optional(formData, "studentProfileId");
  return studentProfileId === "none" ? null : studentProfileId;
}

function optionalUserId(formData: FormData, key: string) {
  const userId = optional(formData, key);
  return userId === "none" ? null : userId;
}

async function findStudentProfileByImportIdentity(fullName: string, email?: string | null) {
  if (email) {
    const user = await prisma.user.findUnique({
      include: { profile: true },
      where: { email },
    });

    if (user?.profile) return user.profile;
  }

  return prisma.studentProfile.findFirst({
    where: { fullName },
  });
}

async function ensureClassMembership(studentProfileId: string, classId?: string | null) {
  if (!classId) return;

  await prisma.classMember.upsert({
    create: { classId, studentProfileId },
    update: {},
    where: {
      classId_studentProfileId: {
        classId,
        studentProfileId,
      },
    },
  });
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

function parsedOrder(formData: FormData) {
  const value = required(formData, "orderedIds");

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parsedTrackLines(formData: FormData) {
  const value = optional(formData, "tracks") ?? "";

  return value
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter((parts) => parts.length >= 2 && parts[0] && parts[1])
    .map(([title, url, artist]) => ({
      artist: artist || null,
      title,
      url,
    }));
}

async function replacePlaylistTracks(playlistId: string, formData: FormData) {
  const tracks = parsedTrackLines(formData);
  await prisma.musicTrack.deleteMany({ where: { playlistId } });

  if (tracks.length) {
    await prisma.musicTrack.createMany({
      data: tracks.map((track, sortOrder) => ({
        ...track,
        playlistId,
        sortOrder,
      })),
    });
  }
}

function normalizeCsvCell(value: string | undefined) {
  return value?.trim().replace(/^"|"$/g, "") ?? "";
}

function parseCsvCells(line: string) {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += character;
    }
  }

  cells.push(cell.trim());
  return cells;
}

function parseCsv(text: string) {
  const [headerLine, ...lines] = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!headerLine) return [];

  const headers = parseCsvCells(headerLine).map((header) => header.trim());

  return lines.map((line) => {
    const cells = parseCsvCells(line);
    return Object.fromEntries(
      headers.map((header, index) => [header, normalizeCsvCell(cells[index])]),
    );
  });
}

function csvDate(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function csvProfileData(row: Record<string, string>, fullName: string) {
  return {
    avatar: row.avatar || null,
    coverImage: row.coverImage || null,
    customPhoto1: row.customPhoto1 || null,
    customPhoto2: row.customPhoto2 || null,
    dob: csvDate(row.dob),
    fullName,
    futureGoal: row.futureGoal || null,
    hobbies: row.hobbies || null,
    nickname: row.nickname || null,
    photoWithTeacher: row.photoWithTeacher || null,
    postGraduateWork: row.postGraduateWork || null,
    school: row.school || null,
    university: row.university || null,
    yearbookMessage: row.yearbookMessage || null,
  };
}

export async function createClassAction(formData: FormData) {
  await requireAdmin();

  const name = required(formData, "name");
  const slug = optional(formData, "slug") ?? slugify(name);
  let classroomId = "";

  try {
    const classroom = await prisma.class.create({
      data: {
        achievements: optional(formData, "achievements"),
        cardBackgroundImage: await optionalImage(formData, "cardBackgroundImage"),
        cardBackgroundImageCrop: optional(formData, "cardBackgroundImageCrop"),
        coverImage: await optionalImage(formData, "coverImage"),
        coverImageCrop: optional(formData, "coverImageCrop"),
        displayOrder: Number(optional(formData, "displayOrder") ?? "0"),
        externalMediaUrl: optional(formData, "externalMediaUrl"),
        introduction: optional(formData, "introduction"),
        name,
        slug,
        slogan: optional(formData, "slogan"),
        monitorId: optionalUserId(formData, "monitorId"),
      },
    });
    classroomId = classroom.id;
  } catch (error) {
    actionFailed("/dashboard/admin/classes/new", "Không thể tạo lớp. Tên hoặc slug có thể đã tồn tại.", error);
  }

  revalidatePath("/dashboard/admin/classes");
  actionCompleted(`/dashboard/classes/${classroomId}/edit`, "Đã tạo lớp mới.");
}

export async function updateClassAction(formData: FormData) {
  await requireAdmin();

  const id = required(formData, "id");
  const name = required(formData, "name");

  await prisma.class.update({
    where: { id },
    data: {
      achievements: optional(formData, "achievements"),
      cardBackgroundImage: await optionalImage(formData, "cardBackgroundImage"),
      cardBackgroundImageCrop: optional(formData, "cardBackgroundImageCrop"),
      coverImage: await optionalImage(formData, "coverImage"),
      coverImageCrop: optional(formData, "coverImageCrop"),
      displayOrder: Number(optional(formData, "displayOrder") ?? "0"),
      externalMediaUrl: optional(formData, "externalMediaUrl"),
      introduction: optional(formData, "introduction"),
      name,
      slug: optional(formData, "slug") ?? slugify(name),
      slogan: optional(formData, "slogan"),
      monitorId: optionalUserId(formData, "monitorId"),
    },
  });

  revalidatePath("/dashboard/admin/classes");
}

export async function assignClassMonitorAction(formData: FormData) {
  await requireAdmin();

  const id = required(formData, "classId");
  const path = `/dashboard/classes/${id}/edit`;

  try {
    await prisma.class.update({
      where: { id },
      data: { monitorId: optionalUserId(formData, "monitorId") },
    });
  } catch (error) {
    actionFailed(path, "Không thể lưu phân công lớp trưởng.", error);
  }

  revalidatePath("/dashboard/admin/classes");
  actionCompleted(path, "Đã lưu phân công lớp trưởng.");
}

export async function reorderClassesAction(formData: FormData) {
  await requireAdmin();
  const ids = parsedOrder(formData);

  if (!ids.length) {
    actionFailed("/dashboard/admin/classes", "Không có thứ tự lớp hợp lệ để lưu.");
  }

  await prisma.$transaction(
    ids.map((id, displayOrder) =>
      prisma.class.update({ data: { displayOrder }, where: { id } }),
    ),
  );

  actionCompleted("/dashboard/admin/classes", "Đã lưu thứ tự lớp học.");
}

export async function createStudentAction(formData: FormData) {
  await requireAdmin();

  const email = required(formData, "email").toLowerCase();
  const fullName = required(formData, "fullName");
  const classId = optionalClassId(formData);
  const password = optional(formData, "password") ?? "Mrtee@2026";
  const role = required(formData, "role") as Role;

  const user = await prisma.user.create({
    include: { profile: true },
    data: {
      classId,
      email,
      name: fullName,
      passwordHash: await hash(password, 12),
      role,
      profile: {
        create: {
          avatar: await optionalImage(formData, "avatar"),
          avatarCrop: optional(formData, "avatarCrop"),
          cardBackgroundImage: await optionalImage(formData, "cardBackgroundImage"),
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
          postGraduateWork: optional(formData, "postGraduateWork"),
          photoWithTeacher: await optionalImage(formData, "photoWithTeacher"),
          photoWithTeacherCrop: optional(formData, "photoWithTeacherCrop"),
          school: optional(formData, "school"),
          university: optional(formData, "university"),
          yearbookMessage: optional(formData, "yearbookMessage"),
        },
      },
    },
  });

  if (user.profile) {
    await ensureClassMembership(user.profile.id, classId);
  }

  revalidatePath("/dashboard/admin/students");
}

export async function updateStudentAction(formData: FormData) {
  await requireAdmin();

  const userId = required(formData, "userId");
  const fullName = required(formData, "fullName");
  const classId = optionalClassId(formData);

  const user = await prisma.user.update({
    include: { profile: true },
    where: { id: userId },
    data: {
      classId,
      email: required(formData, "email").toLowerCase(),
      name: fullName,
      role: required(formData, "role") as Role,
      profile: {
        upsert: {
          create: {
            avatar: await optionalImage(formData, "avatar"),
            avatarCrop: optional(formData, "avatarCrop"),
            cardBackgroundImage: await optionalImage(formData, "cardBackgroundImage"),
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
            postGraduateWork: optional(formData, "postGraduateWork"),
            photoWithTeacher: await optionalImage(formData, "photoWithTeacher"),
            photoWithTeacherCrop: optional(formData, "photoWithTeacherCrop"),
            school: optional(formData, "school"),
            university: optional(formData, "university"),
            yearbookMessage: optional(formData, "yearbookMessage"),
          },
          update: {
            avatar: await optionalImage(formData, "avatar"),
            avatarCrop: optional(formData, "avatarCrop"),
            cardBackgroundImage: await optionalImage(formData, "cardBackgroundImage"),
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
            postGraduateWork: optional(formData, "postGraduateWork"),
            photoWithTeacher: await optionalImage(formData, "photoWithTeacher"),
            photoWithTeacherCrop: optional(formData, "photoWithTeacherCrop"),
            school: optional(formData, "school"),
            university: optional(formData, "university"),
            yearbookMessage: optional(formData, "yearbookMessage"),
          },
        },
      },
    },
  });

  if (user.profile) {
    await ensureClassMembership(user.profile.id, classId);
  }

  revalidatePath("/dashboard/admin/students");
  revalidatePath("/", "layout");
}

export async function removeClassMemberAction(formData: FormData) {
  await requireAdmin();

  const classId = required(formData, "classId");
  const userId = required(formData, "userId");

  const user = await prisma.user.findUnique({
    select: { profile: { select: { id: true } } },
    where: { id: userId },
  });

  await prisma.user.updateMany({
    data: { classId: null },
    where: { classId, id: userId },
  });

  if (user?.profile) {
    await prisma.classMember.deleteMany({
      where: { classId, studentProfileId: user.profile.id },
    });
  }

  revalidatePath(`/dashboard/classes/${classId}/edit`);
  revalidatePath("/dashboard/admin/classes");
  revalidatePath("/", "layout");
}

export async function upsertStudentYearRecordAction(formData: FormData) {
  await requireAdmin();

  const studentProfileId = required(formData, "studentProfileId");
  const year = Number(required(formData, "year"));
  const fullName = required(formData, "fullName");

  await prisma.studentYearRecord.upsert({
    where: {
      studentProfileId_year: {
        studentProfileId,
        year,
      },
    },
    update: {
      avatar: await optionalImage(formData, "avatar"),
      className: optional(formData, "className"),
      coverImage: await optionalImage(formData, "coverImage"),
      customPhoto1: await optionalImage(formData, "customPhoto1"),
      customPhoto2: await optionalImage(formData, "customPhoto2"),
      dob: optionalDate(formData, "dob"),
      email: optional(formData, "email"),
      fullName,
      futureGoal: optional(formData, "futureGoal"),
      nickname: optional(formData, "nickname"),
      photoWithTeacher: await optionalImage(formData, "photoWithTeacher"),
      postGraduateWork: optional(formData, "postGraduateWork"),
      school: optional(formData, "school"),
      shortMessage: optional(formData, "shortMessage"),
      university: optional(formData, "university"),
    },
    create: {
      avatar: await optionalImage(formData, "avatar"),
      className: optional(formData, "className"),
      coverImage: await optionalImage(formData, "coverImage"),
      customPhoto1: await optionalImage(formData, "customPhoto1"),
      customPhoto2: await optionalImage(formData, "customPhoto2"),
      dob: optionalDate(formData, "dob"),
      email: optional(formData, "email"),
      fullName,
      futureGoal: optional(formData, "futureGoal"),
      nickname: optional(formData, "nickname"),
      photoWithTeacher: await optionalImage(formData, "photoWithTeacher"),
      postGraduateWork: optional(formData, "postGraduateWork"),
      school: optional(formData, "school"),
      shortMessage: optional(formData, "shortMessage"),
      studentProfileId,
      university: optional(formData, "university"),
      year,
    },
  });

  revalidatePath("/dashboard/admin/students");
}

export async function importStudentPagesAction(formData: FormData) {
  await requireAdmin();
  const path = "/dashboard/admin/students";
  const context = required(formData, "studentPageContext");
  const students = parseStudentImportLines(required(formData, "studentPageNames"));

  if (!students.length) {
    actionFailed(path, "Danh sách học sinh chưa hợp lệ. Mỗi dòng cần có tên học sinh.");
  }

  const [scope, id] = context.split(":");
  let classId: string | null = null;
  let teamId: string | null = null;
  let contextSlug = "";

  if (scope === StudentPageScope.CLASS) {
    const classroom = await prisma.class.findUnique({
      select: { id: true, slug: true },
      where: { id },
    });

    if (!classroom) {
      actionFailed(path, "Không tìm thấy lớp học đã chọn.");
    }

    classId = classroom.id;
    contextSlug = classroom.slug;
  } else if (scope === StudentPageScope.TEAM) {
    const team = await prisma.team.findUnique({
      select: { category: true, id: true, year: true },
      where: { id },
    });

    if (!team) {
      actionFailed(path, "Không tìm thấy đội tuyển đã chọn.");
    }

    teamId = team.id;
    contextSlug = `${team.category.toLowerCase().replace("_", "-")}-${team.year}`;
  } else if (scope === StudentPageScope.INDEPENDENT) {
    contextSlug = "independent";
  } else {
    actionFailed(path, "Ngữ cảnh import không hợp lệ.");
  }

  let importedCount = 0;
  const passwordHash = await hash("Mrtee@2026", 12);

  for (const student of students) {
    const email = student.email ?? studentEmailFromSlug(contextSlug, student.slug);
    let profile = await findStudentProfileByImportIdentity(student.fullName, student.email);

    if (!profile) {
      const user = await prisma.user.upsert({
        create: {
          classId,
          email,
          name: student.fullName,
          passwordHash,
          role: Role.STUDENT,
        },
        update: {
          classId: classId ?? undefined,
          name: student.fullName,
        },
        where: { email },
      });

      profile = await prisma.studentProfile.upsert({
        create: {
          fullName: student.fullName,
          userId: user.id,
        },
        update: {
          fullName: student.fullName,
        },
        where: { userId: user.id },
      });
    } else if (classId) {
      await prisma.user.updateMany({
        data: { classId },
        where: { id: profile.userId, classId: null },
      });
    }

    await ensureClassMembership(profile.id, classId);

    if (teamId) {
      await prisma.teamMember.upsert({
        create: {
          studentProfileId: profile.id,
          teamId,
        },
        update: {},
        where: {
          teamId_studentProfileId: {
            studentProfileId: profile.id,
            teamId,
          },
        },
      });
    }

    const existingPage = await prisma.studentPage.findFirst({
      select: { id: true, studentSlug: true },
      where: {
        classId: classId ?? undefined,
        scope: scope as StudentPageScope,
        studentProfileId: profile.id,
        teamId: teamId ?? undefined,
      },
    });
    const studentSlug = await uniqueStudentSlug({
      baseSlug: student.slug,
      classId,
      excludeId: existingPage?.id,
      scope: scope as StudentPageScope,
      teamId,
    });

    if (existingPage) {
      await prisma.studentPage.update({
        data: { fullNameSnapshot: student.fullName, studentSlug },
        where: { id: existingPage.id },
      });
    } else {
      await prisma.studentPage.create({
        data: {
          classId,
          fullNameSnapshot: student.fullName,
          inputToken: studentPageToken(),
          scope: scope as StudentPageScope,
          studentProfileId: profile.id,
          studentSlug,
          teamId,
        },
      });
    }

    importedCount += 1;
  }

  revalidatePath(path);
  revalidatePath("/", "layout");
  actionCompleted(path, `Đã tạo ${importedCount} trang học sinh và link nhập liệu.`);
}

export async function regenerateStudentPageTokenAction(formData: FormData) {
  await requireAdmin();

  await prisma.studentPage.update({
    data: { inputToken: studentPageToken() },
    where: { id: required(formData, "studentPageId") },
  });

  actionCompleted("/dashboard/admin/students", "Đã tạo link mới cho học sinh.");
}

export async function deleteStudentPagesAction(formData: FormData) {
  await requireAdmin();
  const path = "/dashboard/admin/students";

  let pageIds: string[] = [];

  try {
    const parsed = JSON.parse(required(formData, "studentPageIds"));
    pageIds = Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
      : [];
  } catch {
    actionFailed(path, "Danh sách link học sinh cần xóa không hợp lệ.");
  }

  if (!pageIds.length) {
    actionFailed(path, "Chưa chọn link học sinh nào để xóa.");
  }

  try {
    const pages = await prisma.studentPage.findMany({
      select: {
        classId: true,
        id: true,
        studentProfileId: true,
        teamId: true,
      },
      where: { id: { in: pageIds } },
    });

    await prisma.$transaction([
      prisma.studentPage.deleteMany({ where: { id: { in: pages.map((page) => page.id) } } }),
      ...pages
        .filter((page) => page.classId)
        .map((page) =>
          prisma.classMember.deleteMany({
            where: {
              classId: page.classId!,
              studentProfileId: page.studentProfileId,
            },
          }),
        ),
      ...pages
        .filter((page) => page.teamId)
        .map((page) =>
          prisma.teamMember.deleteMany({
            where: {
              studentProfileId: page.studentProfileId,
              teamId: page.teamId!,
            },
          }),
        ),
    ]);
  } catch (error) {
    actionFailed(path, "Không thể xóa các link học sinh đã chọn.", error);
  }

  actionCompleted(path, `Đã xóa ${pageIds.length} link học sinh đã chọn. Hồ sơ gốc vẫn được giữ lại.`);
}

export async function deleteStudentProfilesAction(formData: FormData) {
  await requireAdmin();
  const path = "/dashboard/admin/students";

  let pageIds: string[] = [];

  try {
    const parsed = JSON.parse(required(formData, "studentPageIds"));
    pageIds = Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
      : [];
  } catch {
    actionFailed(path, "Danh sách học sinh cần xóa không hợp lệ.");
  }

  if (!pageIds.length) {
    actionFailed(path, "Chưa chọn học sinh nào để xóa sạch.");
  }

  try {
    const pages = await prisma.studentPage.findMany({
      select: {
        studentProfile: { select: { userId: true } },
      },
      where: { id: { in: pageIds } },
    });
    const userIds = Array.from(new Set(pages.map((page) => page.studentProfile.userId)));

    if (!userIds.length) {
      actionFailed(path, "Không tìm thấy hồ sơ học sinh tương ứng để xóa.");
    }

    await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });
  } catch (error) {
    actionFailed(path, "Không thể xóa sạch các hồ sơ học sinh đã chọn.", error);
  }

  actionCompleted(path, `Đã xóa sạch ${pageIds.length} mục đã chọn khỏi hệ thống.`);
}

export async function importClassMembersAction(formData: FormData) {
  await requireAdmin();

  const classId = required(formData, "classId");
  const path = `/dashboard/classes/${classId}/edit`;
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    actionFailed(path, "Vui lòng chọn file CSV trước khi import.");
  }

  let importedCount = 0;

  try {
    const rows = parseCsv(await file.text());
    const passwordHash = await hash("Mrtee@2026", 12);

    for (const row of rows) {
      const email = row.email?.toLowerCase();
      const fullName = row.fullName || row.name;

      if (!email || !fullName) continue;

      const user = await prisma.user.upsert({
        where: { email },
        update: {
          classId,
          name: fullName,
        },
        create: {
          classId,
          email,
          name: fullName,
          passwordHash,
          role: Role.STUDENT,
        },
      });

      const profile = await prisma.studentProfile.upsert({
        where: { userId: user.id },
        update: csvProfileData(row, fullName),
        create: {
          ...csvProfileData(row, fullName),
          userId: user.id,
        },
      });

      await ensureClassMembership(profile.id, classId);
      importedCount += 1;
    }
  } catch (error) {
    actionFailed(path, "Import CSV thất bại. Hãy kiểm tra định dạng file mẫu.", error);
  }

  if (importedCount === 0) {
    actionFailed(path, "CSV không có dòng hợp lệ. Cần tối thiểu cột email và fullName.");
  }

  revalidatePath("/dashboard/admin/classes");
  actionCompleted(path, `Đã import ${importedCount} thành viên vào lớp.`);
}

export async function importTeamMembersAction(formData: FormData) {
  await requireAdmin();

  const teamId = required(formData, "teamId");
  const path = `/dashboard/teams/${teamId}/edit`;
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    actionFailed(path, "Vui lòng chọn file CSV trước khi import.");
  }

  let importedCount = 0;

  try {
    const rows = parseCsv(await file.text());
    const passwordHash = await hash("Mrtee@2026", 12);

    for (const row of rows) {
      const email = row.email?.toLowerCase();
      const fullName = row.fullName || row.name;

      if (!email || !fullName) continue;

      const user = await prisma.user.upsert({
        create: {
          email,
          name: fullName,
          passwordHash,
          role: Role.STUDENT,
        },
        update: {
          name: fullName,
        },
        where: { email },
      });

      const profile = await prisma.studentProfile.upsert({
        create: {
          ...csvProfileData(row, fullName),
          userId: user.id,
        },
        update: csvProfileData(row, fullName),
        where: { userId: user.id },
      });

      await prisma.teamMember.upsert({
        create: {
          role: row.role || null,
          studentProfileId: profile.id,
          teamId,
        },
        update: {
          role: row.role || null,
        },
        where: {
          teamId_studentProfileId: {
            studentProfileId: profile.id,
            teamId,
          },
        },
      });
      importedCount += 1;
    }
  } catch (error) {
    actionFailed(path, "Import CSV thất bại. Hãy kiểm tra định dạng file mẫu.", error);
  }

  if (importedCount === 0) {
    actionFailed(path, "CSV không có dòng hợp lệ. Cần tối thiểu cột email và fullName.");
  }

  revalidatePath("/dashboard/admin/teams");
  actionCompleted(path, `Đã import ${importedCount} thành viên vào đội.`);
}

export async function createTeamAction(formData: FormData) {
  await requireAdmin();
  let teamId = "";

  try {
    const team = await prisma.team.create({
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
        displayOrder: Number(optional(formData, "displayOrder") ?? "0"),
        galleryImages: (optional(formData, "galleryImages") ?? "")
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        introContent: optional(formData, "introContent"),
        introFormat: required(formData, "introFormat") as ContentFormat,
        monitorId: optionalUserId(formData, "monitorId"),
        year: Number(required(formData, "year")),
      },
    });
    teamId = team.id;
  } catch (error) {
    actionFailed("/dashboard/admin/teams/new", "Không thể tạo đội tuyển. Nhóm và năm có thể đã tồn tại.", error);
  }

  revalidatePath("/dashboard/admin/teams");
  actionCompleted(`/dashboard/teams/${teamId}/edit`, "Đã tạo đội tuyển mới.");
}

export async function updateTeamAction(formData: FormData) {
  await requireAdmin();

  await prisma.team.update({
    where: { id: required(formData, "id") },
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
      displayOrder: Number(optional(formData, "displayOrder") ?? "0"),
      galleryImages: (optional(formData, "galleryImages") ?? "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      introContent: optional(formData, "introContent"),
      introFormat: required(formData, "introFormat") as ContentFormat,
      monitorId: optionalUserId(formData, "monitorId"),
      year: Number(required(formData, "year")),
    },
  });

  revalidatePath("/dashboard/admin/teams");
}

export async function assignTeamMonitorAction(formData: FormData) {
  await requireAdmin();

  const id = required(formData, "teamId");
  const path = `/dashboard/teams/${id}/edit`;

  try {
    await prisma.team.update({
      where: { id },
      data: { monitorId: optionalUserId(formData, "monitorId") },
    });
  } catch (error) {
    actionFailed(path, "Không thể lưu phân công đội trưởng.", error);
  }

  revalidatePath("/dashboard/admin/teams");
  actionCompleted(path, "Đã lưu phân công đội trưởng.");
}

export async function reorderTeamsAction(formData: FormData) {
  await requireAdmin();
  const ids = parsedOrder(formData);

  if (!ids.length) {
    actionFailed("/dashboard/admin/teams", "Không có thứ tự đội tuyển hợp lệ để lưu.");
  }

  await prisma.$transaction(
    ids.map((id, displayOrder) =>
      prisma.team.update({ data: { displayOrder }, where: { id } }),
    ),
  );

  actionCompleted("/dashboard/admin/teams", "Đã lưu thứ tự đội tuyển.");
}

export async function addTeamMemberAction(formData: FormData) {
  await requireAdmin();

  await prisma.teamMember.upsert({
    where: {
      teamId_studentProfileId: {
        studentProfileId: required(formData, "studentProfileId"),
        teamId: required(formData, "teamId"),
      },
    },
    update: {
      role: optional(formData, "role"),
    },
    create: {
      role: optional(formData, "role"),
      studentProfileId: required(formData, "studentProfileId"),
      teamId: required(formData, "teamId"),
    },
  });

  revalidatePath("/dashboard/admin/teams");
}

export async function removeTeamMemberAction(formData: FormData) {
  await requireAdmin();

  const teamId = required(formData, "teamId");

  await prisma.teamMember.deleteMany({
    where: {
      id: required(formData, "memberId"),
      teamId,
    },
  });

  revalidatePath(`/dashboard/teams/${teamId}/edit`);
  revalidatePath("/dashboard/admin/teams");
  revalidatePath("/", "layout");
}

export async function createPostAction(formData: FormData) {
  const session = await requireAdmin();
  const title = required(formData, "title");

  await prisma.post.create({
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
      showOnHome: formData.get("showOnHome") === "on",
      slug: optional(formData, "slug") ?? defaultSlug(title),
      title,
    },
  });

  revalidatePath("/dashboard/admin/posts");
  revalidatePath("/blog");
}

export async function updatePostAction(formData: FormData) {
  await requireAdmin();
  const title = required(formData, "title");

  await prisma.post.update({
    where: { id: required(formData, "id") },
    data: {
      backgroundImage: await optionalImage(formData, "backgroundImage"),
      backgroundImageCrop: optional(formData, "backgroundImageCrop"),
      content: required(formData, "content"),
      contentFormat: required(formData, "contentFormat") as ContentFormat,
      coverImage: await optionalImage(formData, "coverImage"),
      coverImageCrop: optional(formData, "coverImageCrop"),
      excerpt: optional(formData, "excerpt"),
      publishedAt: optionalPublishedAt(formData),
      showOnHome: formData.get("showOnHome") === "on",
      slug: optional(formData, "slug") ?? defaultSlug(title),
      title,
    },
  });

  revalidatePath("/dashboard/admin/posts");
  revalidatePath("/blog");
}

export async function createMemoryPostAction(formData: FormData) {
  const session = await requireAdmin();
  const title = required(formData, "title");

  await prisma.memoryPost.create({
    data: {
      authorId: session.user.id,
      backgroundImage: await optionalImage(formData, "backgroundImage"),
      backgroundImageCrop: optional(formData, "backgroundImageCrop"),
      classId: optionalClassId(formData),
      content: required(formData, "content"),
      contentFormat: required(formData, "contentFormat") as ContentFormat,
      coverImage: await optionalImage(formData, "coverImage"),
      coverImageCrop: optional(formData, "coverImageCrop"),
      excerpt: optional(formData, "excerpt"),
      publishedAt: optionalPublishedAt(formData),
      showOnHome: formData.get("showOnHome") === "on",
      slug: optional(formData, "slug") ?? defaultSlug(title),
      studentProfileId: optionalStudentProfileId(formData),
      teamId: optionalTeamId(formData),
      title,
      type: required(formData, "type") as MemoryPostType,
    },
  });

  revalidatePath("/dashboard/admin/memories");
  revalidatePath("/", "layout");
}

export async function updateMemoryPostAction(formData: FormData) {
  await requireAdmin();
  const title = required(formData, "title");

  await prisma.memoryPost.update({
    where: { id: required(formData, "id") },
    data: {
      backgroundImage: await optionalImage(formData, "backgroundImage"),
      backgroundImageCrop: optional(formData, "backgroundImageCrop"),
      classId: optionalClassId(formData),
      content: required(formData, "content"),
      contentFormat: required(formData, "contentFormat") as ContentFormat,
      coverImage: await optionalImage(formData, "coverImage"),
      coverImageCrop: optional(formData, "coverImageCrop"),
      excerpt: optional(formData, "excerpt"),
      publishedAt: optionalPublishedAt(formData),
      showOnHome: formData.get("showOnHome") === "on",
      slug: optional(formData, "slug") ?? defaultSlug(title),
      studentProfileId: optionalStudentProfileId(formData),
      teamId: optionalTeamId(formData),
      title,
      type: required(formData, "type") as MemoryPostType,
    },
  });

  revalidatePath("/dashboard/admin/memories");
  revalidatePath("/", "layout");
}

export async function deleteMemoryPostAction(formData: FormData) {
  await requireAdmin();

  await prisma.memoryPost.delete({
    where: { id: required(formData, "id") },
  });

  revalidatePath("/dashboard/admin/memories");
  revalidatePath("/", "layout");
}

export async function updateHomePostVisibilityAction(formData: FormData) {
  await requireAdmin();
  const path = "/dashboard/admin/home";
  const id = required(formData, "id");
  const type = required(formData, "type");
  const showOnHome = formData.get("showOnHome") === "on";

  try {
    if (type === "post") {
      await prisma.post.update({
        data: { showOnHome },
        where: { id },
      });
    } else if (type === "memory") {
      await prisma.memoryPost.update({
        data: { showOnHome },
        where: { id },
      });
    } else {
      actionFailed(path, "Loại bài viết không hợp lệ.");
    }
  } catch (error) {
    actionFailed(path, "Không thể cập nhật bài viết ngoài trang chủ.", error);
  }

  actionCompleted(path, "Đã cập nhật bài viết ngoài trang chủ.");
}

export async function updateHomeAlbumVisibilityAction(formData: FormData) {
  await requireAdmin();
  const path = "/dashboard/admin/home";

  try {
    await prisma.album.update({
      data: {
        published: formData.get("published") === "on",
        showOnHome: formData.get("showOnHome") === "on",
        viewMode: (optional(formData, "viewMode") ?? AlbumViewMode.GRID) as AlbumViewMode,
      },
      where: { id: required(formData, "id") },
    });
  } catch (error) {
    actionFailed(path, "Không thể cập nhật album ngoài trang chủ.", error);
  }

  actionCompleted(path, "Đã cập nhật album ngoài trang chủ.");
}

export async function updateHomeSectionVisibilityAction(formData: FormData) {
  await requireAdmin();
  const path = "/dashboard/admin/home";
  const updates = [
    {
      key: homeSectionSettingKeys.allPosts,
      value: formData.get("allPosts") === "on" ? "true" : "false",
    },
    {
      key: homeSectionSettingKeys.allImages,
      value: formData.get("allImages") === "on" ? "true" : "false",
    },
    {
      key: homeSectionSettingKeys.allVideos,
      value: formData.get("allVideos") === "on" ? "true" : "false",
    },
  ];

  try {
    await prisma.$transaction(
      updates.map((item) =>
        prisma.siteSetting.upsert({
          create: item,
          update: { value: item.value },
          where: { key: item.key },
        }),
      ),
    );
  } catch (error) {
    actionFailed(path, "Không thể lưu cấu hình hiển thị trang chủ.", error);
  }

  actionCompleted(path, "Đã lưu cấu hình hiển thị trang chủ.");
}

export async function createHomeHeroSlideAction(formData: FormData) {
  await requireAdmin();
  const path = "/dashboard/admin/home";

  try {
    const image = await optionalImage(formData, "image");

    if (!image) {
      actionFailed(path, "Ảnh banner là bắt buộc.");
    }

    const slides = await getHomeHeroSlides();
    slides.push({
      caption: optional(formData, "caption") ?? "",
      image,
      imageCrop: optional(formData, "imageCrop") ?? "50% 50%",
    });

    await setHomeHeroSlides(slides);
  } catch (error) {
    actionFailed(path, "Không thể thêm slide banner trang chủ.", error);
  }

  actionCompleted(path, "Đã thêm slide banner trang chủ.");
}

export async function updateHomeHeroSlideAction(formData: FormData) {
  await requireAdmin();
  const path = "/dashboard/admin/home";
  const index = Number(required(formData, "index"));

  try {
    const slides = await getHomeHeroSlides();

    if (!Number.isInteger(index) || index < 0 || index >= slides.length) {
      actionFailed(path, "Slide banner không hợp lệ.");
    }

    const image = await optionalImage(formData, "image");
    slides[index] = {
      caption: optional(formData, "caption") ?? "",
      image: image ?? slides[index].image,
      imageCrop: optional(formData, "imageCrop") ?? "50% 50%",
    };

    await setHomeHeroSlides(slides);
  } catch (error) {
    actionFailed(path, "Không thể lưu slide banner trang chủ.", error);
  }

  actionCompleted(path, "Đã lưu slide banner trang chủ.");
}

export async function deleteHomeHeroSlideAction(formData: FormData) {
  await requireAdmin();
  const path = "/dashboard/admin/home";
  const index = Number(required(formData, "index"));

  try {
    const slides = await getHomeHeroSlides();

    if (!Number.isInteger(index) || index < 0 || index >= slides.length) {
      actionFailed(path, "Slide banner không hợp lệ.");
    }

    slides.splice(index, 1);
    await setHomeHeroSlides(slides);
  } catch (error) {
    actionFailed(path, "Không thể xóa slide banner trang chủ.", error);
  }

  actionCompleted(path, "Đã xóa slide banner trang chủ.");
}

export async function createPlaylistAction(formData: FormData) {
  await requireAdmin();
  const path = "/dashboard/admin/music";

  try {
    const makeDefault = formData.get("isSiteDefault") === "on";

    if (makeDefault) {
      await prisma.musicPlaylist.updateMany({ data: { isSiteDefault: false } });
    }

    const playlist = await prisma.musicPlaylist.create({
      data: {
        description: optional(formData, "description"),
        isSiteDefault: makeDefault,
        name: required(formData, "name"),
      },
    });
    await replacePlaylistTracks(playlist.id, formData);
  } catch (error) {
    actionFailed(path, "Không thể tạo playlist.", error);
  }

  actionCompleted(path, "Đã tạo playlist nhạc.");
}

export async function updatePlaylistAction(formData: FormData) {
  await requireAdmin();
  const path = "/dashboard/admin/music";
  const playlistId = required(formData, "playlistId");

  try {
    const makeDefault = formData.get("isSiteDefault") === "on";

    if (makeDefault) {
      await prisma.musicPlaylist.updateMany({
        data: { isSiteDefault: false },
        where: { NOT: { id: playlistId } },
      });
    }

    await prisma.musicPlaylist.update({
      data: {
        description: optional(formData, "description"),
        isSiteDefault: makeDefault,
        name: required(formData, "name"),
      },
      where: { id: playlistId },
    });
    await replacePlaylistTracks(playlistId, formData);
  } catch (error) {
    actionFailed(path, "Không thể lưu playlist.", error);
  }

  actionCompleted(path, "Đã lưu playlist nhạc.");
}

export async function deletePlaylistAction(formData: FormData) {
  await requireAdmin();
  const path = "/dashboard/admin/music";

  try {
    await prisma.musicPlaylist.delete({
      where: { id: required(formData, "playlistId") },
    });
  } catch (error) {
    actionFailed(path, "Không thể xóa playlist.", error);
  }

  actionCompleted(path, "Đã xóa playlist nhạc.");
}
