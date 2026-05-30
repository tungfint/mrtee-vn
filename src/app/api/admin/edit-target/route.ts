import { StudentPageScope, TeamCategory } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const teamSlugs = new Set(["hsg-tin", "ftc", "ai"]);

function categoryFromSlug(slug: string) {
  if (slug === "hsg-tin") return TeamCategory.HSG_TIN;
  if (slug === "ftc") return TeamCategory.FTC;
  if (slug === "ai") return TeamCategory.AI;
  return null;
}

function jsonTarget(href: string, label = "Sửa trang này") {
  return NextResponse.json({ href, label });
}

async function sectionTarget(parts: string[], section: string) {
  const label = section === "albums" ? "Sửa album ảnh" : "Sửa video";

  if (!parts.length) {
    return jsonTarget("/dashboard/admin/home", label);
  }

  if (teamSlugs.has(parts[0])) {
    const category = categoryFromSlug(parts[0]);
    const year = Number(parts[1]);

    if (category && Number.isInteger(year)) {
      const team = await prisma.team.findUnique({
        select: { id: true },
        where: { category_year: { category, year } },
      });

      return jsonTarget(team ? `/dashboard/teams/${team.id}/edit#team-albums` : "/dashboard/admin/teams", label);
    }

    return jsonTarget("/dashboard/admin/teams", label);
  }

  const classroom = await prisma.class.findUnique({
    select: { id: true },
    where: { slug: parts[0] },
  });

  if (classroom) {
    return jsonTarget(`/dashboard/classes/${classroom.id}/edit#class-albums`, label);
  }

  return jsonTarget("/dashboard/admin/albums", label);
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const path = url.searchParams.get("path") ?? "/";
  const section = url.searchParams.get("section");
  const parts = path.split("/").filter(Boolean);

  if (section === "albums" || section === "videos") {
    return sectionTarget(parts, section);
  }

  if (!parts.length) {
    return jsonTarget("/dashboard/admin/home", "Sửa trang chủ");
  }

  if (parts[0] === "blog" && parts[1]) {
    const post = await prisma.post.findUnique({
      select: { id: true },
      where: { slug: parts[1] },
    });

    return jsonTarget(post ? `/dashboard/admin/posts#post-${post.id}` : "/dashboard/admin/posts", "Sửa bài viết");
  }

  if (parts[0] === "memory" && parts[1]) {
    const post = await prisma.memoryPost.findUnique({
      select: { classId: true, id: true, teamId: true },
      where: { slug: parts[1] },
    });

    if (post?.classId) return jsonTarget(`/dashboard/classes/${post.classId}/edit#post-${post.id}`, "Sửa bài viết");
    if (post?.teamId) return jsonTarget(`/dashboard/teams/${post.teamId}/edit#post-${post.id}`, "Sửa bài viết");

    return jsonTarget(post ? `/dashboard/admin/memories#memory-${post.id}` : "/dashboard/admin/memories", "Sửa bài viết");
  }

  if (parts[0] === "student" && parts[1]) {
    const page = await prisma.studentPage.findFirst({
      select: { inputToken: true, studentSlug: true },
      where: {
        OR: [
          { scope: StudentPageScope.INDEPENDENT, studentSlug: parts[1] },
          { studentProfileId: parts[1] },
        ],
      },
    });

    if (page) {
      return jsonTarget(`/student/${page.studentSlug}/thongtin/${page.inputToken}`, "Sửa học sinh");
    }

    return jsonTarget("/dashboard/admin/students", "Sửa học sinh");
  }

  if (teamSlugs.has(parts[0])) {
    const category = categoryFromSlug(parts[0]);
    const year = Number(parts[1]);

    if (category && Number.isInteger(year)) {
      if (parts[2]) {
        const page = await prisma.studentPage.findFirst({
          include: { team: { select: { category: true, year: true } } },
          where: {
            studentSlug: parts[2],
            team: { category, year },
          },
        });

        if (page?.team) {
          return jsonTarget(`/${parts[0]}/${year}/${page.studentSlug}/thongtin/${page.inputToken}`, "Sửa học sinh");
        }
      }

      const team = await prisma.team.findUnique({
        select: { id: true },
        where: { category_year: { category, year } },
      });

      return jsonTarget(team ? `/dashboard/teams/${team.id}/edit` : "/dashboard/admin/teams", "Sửa đội tuyển");
    }

    return jsonTarget("/dashboard/admin/teams", "Sửa đội tuyển");
  }

  if (parts[1]) {
    const page = await prisma.studentPage.findFirst({
      include: { class: { select: { slug: true } } },
      where: {
        class: { slug: parts[0] },
        studentSlug: parts[1],
      },
    });

    if (page?.class) {
      return jsonTarget(`/${page.class.slug}/${page.studentSlug}/thongtin/${page.inputToken}`, "Sửa học sinh");
    }
  }

  const classroom = await prisma.class.findUnique({
    select: { id: true },
    where: { slug: parts[0] },
  });

  if (classroom) {
    return jsonTarget(`/dashboard/classes/${classroom.id}/edit`, "Sửa lớp học");
  }

  return jsonTarget("/dashboard/admin", "Mở quản trị");
}
