import { ContentFormat, Role, TeamCategory } from "@prisma/client";
import { ArrowLeft, Download } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ActionFeedback,
  Field,
  FormGrid,
  ImageStandards,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/admin-shell";
import { AlbumManager } from "@/components/admin/album-manager";
import { EditorNavigation } from "@/components/admin/editor-navigation";
import { ImageField } from "@/components/admin/image-field";
import { MediaAssetsField } from "@/components/admin/media-assets-field";
import { authOptions } from "@/lib/auth";
import { canEditTeam } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  assignTeamMonitorAction,
  importTeamMembersAction,
} from "../../../admin/actions";
import {
  addManagedTeamMemberAction,
  createManagedTeamAlbumAction,
  createManagedTeamPostAction,
  deleteManagedTeamAlbumAction,
  deleteManagedTeamPostAction,
  removeManagedTeamMemberAction,
  updateManagedTeamAlbumAction,
  updateManagedTeamAction,
  updateManagedTeamMemberAction,
  updateManagedTeamPostAction,
} from "../../../managed-actions";

export const dynamic = "force-dynamic";

function dateInputValue(value?: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function EditTeamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; status?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const { id } = await params;
  const feedback = await searchParams;
  const [team, studentProfiles, classes, monitorUsers, playlists] = await Promise.all([
    prisma.team.findUnique({
      include: {
        albums: {
          include: { items: { orderBy: { sortOrder: "asc" } } },
          orderBy: { sortOrder: "asc" },
        },
        members: {
          include: {
            studentProfile: {
              include: {
                user: {
                  include: { classroom: { select: { name: true } } },
                },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        memoryPosts: {
          include: { media: { orderBy: { sortOrder: "asc" } } },
          orderBy: { updatedAt: "desc" },
        },
      },
      where: { id },
    }),
    prisma.studentProfile.findMany({
      include: {
        user: { select: { email: true, id: true, name: true } },
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    session.user.role === Role.ADMIN
      ? prisma.user.findMany({
          orderBy: { email: "asc" },
          select: { email: true, id: true, name: true, role: true },
        })
      : Promise.resolve([]),
    prisma.musicPlaylist.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!team || !canEditTeam(session.user, team)) {
    redirect("/dashboard");
  }

  const postEditor = (post: (typeof team.memoryPosts)[number]) => (
    <details
      className="overflow-hidden rounded-md border border-slate-200 bg-slate-50"
      key={post.id}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-slate-800 hover:bg-slate-100">
        {post.title}
        <span className="text-xs font-medium text-slate-500">
          {post.publishedAt ? "Public" : "Private"} · Mở bài
        </span>
      </summary>
    <form
      action={updateManagedTeamPostAction}
      className="border-t border-slate-200 p-4"
    >
      <input name="teamId" type="hidden" value={team.id} />
      <input name="postId" type="hidden" value={post.id} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">{post.title}</h3>
          <p className="text-sm text-slate-500">
            {post.publishedAt ? "Public" : "Private"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            type="submit"
          >
            Lưu bài
          </button>
          <button
            className="rounded-md border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
            formAction={deleteManagedTeamPostAction}
            formNoValidate
            type="submit"
          >
            Xóa
          </button>
        </div>
      </div>
      <FormGrid>
        <Field label="Tiêu đề">
          <input className={inputClass} defaultValue={post.title} name="title" required />
        </Field>
        <Field label="Slug">
          <input className={inputClass} defaultValue={post.slug ?? ""} name="slug" />
        </Field>
        <Field label="Thành viên liên quan">
          <select
            className={selectClass}
            defaultValue={post.studentProfileId ?? "none"}
            name="studentProfileId"
          >
            <option value="none">Bài chung của đội</option>
            {team.members.map((member) => (
              <option key={member.studentProfile.id} value={member.studentProfile.id}>
                {member.studentProfile.fullName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Định dạng">
          <select className={selectClass} defaultValue={post.contentFormat} name="contentFormat">
            {Object.values(ContentFormat).map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-end gap-2 pb-3 text-sm font-medium text-slate-700">
          <input defaultChecked={Boolean(post.publishedAt)} name="published" type="checkbox" />
          Public bài viết
        </label>
        <label className="flex items-end gap-2 pb-3 text-sm font-medium text-slate-700">
          <input defaultChecked={post.showOnHome} name="showOnHome" type="checkbox" />
          Hiển thị ở trang chủ
        </label>
      </FormGrid>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ImageField
          cropName="coverImageCrop"
          defaultCrop={post.coverImageCrop}
          defaultValue={post.coverImage}
          label="Ảnh cover bài viết"
          name="coverImage"
          recommendedSize="1600 x 900px"
        />
        <ImageField
          cropName="backgroundImageCrop"
          defaultCrop={post.backgroundImageCrop}
          defaultValue={post.backgroundImage}
          label="Ảnh nền bài viết"
          name="backgroundImage"
          recommendedSize="1920 x 1080px"
        />
      </div>
      <Field label="Tóm tắt">
        <textarea className={textareaClass} defaultValue={post.excerpt ?? ""} name="excerpt" />
      </Field>
      <Field label="Nội dung Markdown / HTML">
        <textarea className={textareaClass} defaultValue={post.content} name="content" required />
      </Field>
      <MediaAssetsField items={post.media} />
    </form>
    </details>
  );

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          href={session.user.role === Role.ADMIN ? "/dashboard/admin/teams" : "/dashboard"}
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Quay lại danh sách đội tuyển
        </Link>

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase text-emerald-700">
            Chỉnh sửa đội tuyển
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold">
                {team.category} {team.year}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Đội trưởng có thể chỉnh thông tin năm, thành viên và bài viết
                chia sẻ của đội tuyển này.
              </p>
            </div>
            <Link
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              href={`/${team.category.toLowerCase().replace("_", "-")}/${team.year}`}
            >
              Xem trang năm {team.year}
            </Link>
          </div>
        </section>
        <ActionFeedback message={feedback.message} status={feedback.status} />

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[210px_minmax(0,1fr)]">
          <EditorNavigation
            items={[
              { href: "#team-information", label: "Thông tin năm" },
              { href: "#team-albums", label: "Album" },
              { href: "#team-import", label: "Phân công / Import" },
              { href: "#team-posts", label: "Bài viết" },
              { href: "#team-members", label: "Thành viên" },
            ]}
          />
          <div className="grid gap-5">
        <details
          className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          id="team-information"
          open
        >
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-slate-900 hover:bg-slate-50">
            Thông tin đội tuyển năm {team.year}
            <span className="text-xs font-medium text-slate-500">Thu gọn / Mở rộng</span>
          </summary>
          <form
            action={updateManagedTeamAction}
            className="border-t border-slate-200 p-5"
          >
          <input name="teamId" type="hidden" value={team.id} />
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Thông tin đội tuyển</h2>
              <p className="mt-1 text-sm text-slate-500">
                Trang chủ đội tuyển dùng phần giới thiệu chung, sau đó hiển thị
                các khối theo năm.
              </p>
            </div>
            <button
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              type="submit"
            >
              Lưu đội tuyển
            </button>
          </div>

          <FormGrid>
            <Field label="Nhóm đội tuyển">
              <select className={selectClass} defaultValue={team.category} name="category">
                {Object.values(TeamCategory).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Năm">
              <input
                className={inputClass}
                defaultValue={team.year}
                name="year"
                required
                type="number"
              />
            </Field>
            <Field label="Định dạng giới thiệu">
              <select
                className={selectClass}
                defaultValue={team.introFormat}
                name="introFormat"
              >
                {Object.values(ContentFormat).map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Thứ tự trên trang chủ">
              <input
                className={inputClass}
                defaultValue={team.displayOrder}
                name="displayOrder"
                type="number"
              />
            </Field>
            <Field label="Thư viện ảnh cũ (hiển thị khi chưa tạo Album)">
              <textarea
                className={textareaClass}
                defaultValue={team.galleryImages.join("\n")}
                name="galleryImages"
                placeholder="Mỗi dòng một URL ảnh hoặc link Google Drive"
              />
            </Field>
          </FormGrid>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <ImageField
              cropName="coverImageCrop"
              defaultCrop={team.coverImageCrop}
              defaultValue={team.coverImage}
              label="Ảnh bìa đội tuyển"
              name="coverImage"
              recommendedSize="1920 x 720px"
            />
            <ImageField
              cropName="cardBackgroundImageCrop"
              defaultCrop={team.cardBackgroundImageCrop}
              defaultValue={team.cardBackgroundImage}
              label="Ảnh nền khối năm"
              name="cardBackgroundImage"
              recommendedSize="1200 x 800px"
            />
            <ImageField
              cropName="backgroundImageCrop"
              defaultCrop={team.backgroundImageCrop}
              defaultValue={team.backgroundImage}
              label="Ảnh nền trang đội tuyển"
              name="backgroundImage"
              recommendedSize="1920 x 1080px"
            />
          </div>

          <div className="mt-4 grid gap-4">
            <Field label="Mô tả ngắn">
              <textarea
                className={textareaClass}
                defaultValue={team.description ?? ""}
                name="description"
              />
            </Field>
            <Field label="Giới thiệu chung / bài chính">
              <textarea
                className={textareaClass}
                defaultValue={team.introContent ?? ""}
                name="introContent"
                placeholder="Markdown/HTML, link YouTube, Google Drive, ảnh, video..."
              />
            </Field>
            <Field label="Thành tích">
              <textarea
                className={textareaClass}
                defaultValue={team.achievements ?? ""}
                name="achievements"
              />
            </Field>
          </div>
          <ImageStandards />
          </form>
        </details>

        <details
          className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          id="team-albums"
          open
        >
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-slate-900 hover:bg-slate-50">
            Album đội tuyển năm {team.year}
            <span className="text-xs font-medium text-slate-500">Thu gọn / Mở rộng</span>
          </summary>
          <section className="border-t border-slate-200 p-5">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Quản lý Album</h2>
              <p className="mt-1 text-sm text-slate-500">
                Album hiển thị ở trang năm đội tuyển, hỗ trợ slideshow, folder Drive và playlist nhạc đi kèm.
              </p>
            </div>
            <AlbumManager
              albums={team.albums}
              createAction={createManagedTeamAlbumAction}
              deleteAction={deleteManagedTeamAlbumAction}
              ownerId={team.id}
              ownerKey="teamId"
              playlists={playlists}
              updateAction={updateManagedTeamAlbumAction}
            />
          </section>
        </details>

        {session.user.role === Role.ADMIN ? (
          <details
            className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            id="team-import"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-slate-900 hover:bg-slate-50">
              Phân công và import thành viên
              <span className="text-xs font-medium text-slate-500">Thu gọn / Mở rộng</span>
            </summary>
            <section className="border-t border-slate-200 p-5">
            <h2 className="text-xl font-semibold">Phân công và import thành viên</h2>
            <p className="mt-1 text-sm text-slate-500">
              Chỉ admin có thể chọn đội trưởng hoặc import danh sách CSV cho đội tuyển này.
            </p>
            <form
              action={assignTeamMonitorAction}
              className="mt-4 flex flex-wrap items-end gap-3"
            >
              <input name="teamId" type="hidden" value={team.id} />
              <Field label="Đội trưởng">
                <select
                  className={selectClass}
                  defaultValue={team.monitorId ?? "none"}
                  name="monitorId"
                >
                  <option value="none">Chưa chọn</option>
                  {monitorUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name ?? user.email} - {user.role}
                    </option>
                  ))}
                </select>
              </Field>
              <button
                className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
                type="submit"
              >
                Lưu phân công
              </button>
            </form>
            <form action={importTeamMembersAction} className="mt-5 flex flex-wrap items-end gap-3">
              <input name="teamId" type="hidden" value={team.id} />
              <Field label="Import CSV thành viên">
                <input accept=".csv,text/csv" className={inputClass} name="file" type="file" />
              </Field>
              <button
                className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
                type="submit"
              >
                Import
              </button>
              <a
                className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                download
                href="/templates/member-import-template.csv"
              >
                <Download aria-hidden className="h-4 w-4" />
                Tải CSV mẫu
              </a>
            </form>
            </section>
          </details>
        ) : null}

        <details
          className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          id="team-posts"
          open
        >
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-slate-900 hover:bg-slate-50">
            Bài viết đội tuyển
            <span className="text-xs font-medium text-slate-500">Thu gọn / Mở rộng</span>
          </summary>
          <section className="border-t border-slate-200 p-5">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Bài viết đội tuyển</h2>
            <p className="mt-1 text-sm text-slate-500">
              Dùng cho lưu bút, chia sẻ hành trình, ảnh, video YouTube hoặc link
              Google Drive của thành viên.
            </p>
          </div>

          <div className="grid gap-4">
            {team.memoryPosts.length ? (
              team.memoryPosts.map(postEditor)
            ) : (
              <p className="text-sm text-slate-500">Chưa có bài viết chia sẻ.</p>
            )}
          </div>

          <form
            action={createManagedTeamPostAction}
            className="mt-8 grid gap-4 rounded-md border border-emerald-200 bg-emerald-50/50 p-4"
          >
            <input name="teamId" type="hidden" value={team.id} />
            <h3 className="text-lg font-semibold">Thêm bài viết mới</h3>
            <FormGrid>
              <Field label="Tiêu đề">
                <input className={inputClass} name="title" required />
              </Field>
              <Field label="Thành viên liên quan">
                <select className={selectClass} defaultValue="none" name="studentProfileId">
                  <option value="none">Bài chung của đội</option>
                  {team.members.map((member) => (
                    <option key={member.studentProfile.id} value={member.studentProfile.id}>
                      {member.studentProfile.fullName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Định dạng">
                <select className={selectClass} name="contentFormat">
                  {Object.values(ContentFormat).map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </Field>
              <label className="flex items-end gap-2 pb-3 text-sm font-medium text-slate-700">
                <input name="published" type="checkbox" />
                Public ngay
              </label>
              <label className="flex items-end gap-2 pb-3 text-sm font-medium text-slate-700">
                <input name="showOnHome" type="checkbox" />
                Hiển thị ở trang chủ
              </label>
            </FormGrid>
            <FormGrid>
              <ImageField
                cropName="coverImageCrop"
                label="Ảnh cover bài viết"
                name="coverImage"
                recommendedSize="1600 x 900px"
              />
              <ImageField
                cropName="backgroundImageCrop"
                label="Ảnh nền bài viết"
                name="backgroundImage"
                recommendedSize="1920 x 1080px"
              />
            </FormGrid>
            <Field label="Tóm tắt hiển thị trên thẻ bài viết">
              <textarea className={textareaClass} name="excerpt" />
            </Field>
            <Field label="Nội dung">
              <textarea
                className={textareaClass}
                name="content"
                placeholder="Markdown/HTML, link YouTube, Google Drive, ảnh, video..."
                required
              />
            </Field>
            <MediaAssetsField />
            <button
              className="w-fit rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              type="submit"
            >
              Thêm bài viết
            </button>
          </form>
          </section>
        </details>

        <details
          className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          id="team-members"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-slate-900 hover:bg-slate-50">
            Thành viên đội tuyển
            <span className="text-xs font-medium text-slate-500">Thu gọn / Mở rộng</span>
          </summary>
          <section className="border-t border-slate-200 p-5">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Thành viên đội tuyển</h2>
            <p className="mt-1 text-sm text-slate-500">
              Mỗi thành viên dùng cùng hồ sơ như phần lớp học, nên có thể cập
              nhật ảnh, email, mục tiêu, đại học và lưu bút ngắn tại đây.
            </p>
          </div>

          <form
            action={addManagedTeamMemberAction}
            className="mb-6 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_220px_auto]"
          >
            <input name="teamId" type="hidden" value={team.id} />
            <select className={selectClass} name="studentProfileId" required>
              {studentProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.fullName} · {profile.user.email}
                </option>
              ))}
            </select>
            <input
              className={inputClass}
              name="role"
              placeholder="Vai trò trong đội"
            />
            <button
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              type="submit"
            >
              Thêm
            </button>
          </form>

          <div className="grid gap-4">
            {team.members.map((member) => (
              <details
                className="overflow-hidden rounded-md border border-slate-200 bg-slate-50"
                key={member.id}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-slate-800 hover:bg-slate-100">
                  {member.studentProfile.fullName}
                  <span className="text-xs font-medium text-slate-500">Mở thông tin</span>
                </summary>
              <form
                action={updateManagedTeamMemberAction}
                className="border-t border-slate-200 p-4"
              >
                <input name="teamId" type="hidden" value={team.id} />
                <input name="memberId" type="hidden" value={member.id} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-semibold">
                    {member.studentProfile.fullName}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                      type="submit"
                    >
                      Lưu thành viên
                    </button>
                    <button
                      className="rounded-md border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                      formAction={removeManagedTeamMemberAction}
                      formNoValidate
                      type="submit"
                    >
                      Xóa khỏi đội
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Họ và tên">
                    <input
                      className={inputClass}
                      defaultValue={member.studentProfile.fullName}
                      name="fullName"
                      required
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      className={inputClass}
                      defaultValue={member.studentProfile.user.email}
                      name="email"
                      required
                      type="email"
                    />
                  </Field>
                  <Field label="Lớp">
                    {session.user.role === Role.ADMIN ? (
                      <select
                        className={selectClass}
                        defaultValue={member.studentProfile.user.classId ?? "none"}
                        name="classId"
                      >
                        <option value="none">Chưa gán lớp</option>
                        {classes.map((classroom) => (
                          <option key={classroom.id} value={classroom.id}>
                            {classroom.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className={`${inputClass} bg-slate-100 text-slate-600`}
                        readOnly
                        value={member.studentProfile.user.classroom?.name ?? "Chưa gán lớp"}
                      />
                    )}
                  </Field>
                  <Field label="Vai trò trong đội">
                    <input
                      className={inputClass}
                      defaultValue={member.role ?? ""}
                      name="memberRole"
                    />
                  </Field>
                  <Field label="Nickname">
                    <input
                      className={inputClass}
                      defaultValue={member.studentProfile.nickname ?? ""}
                      name="nickname"
                    />
                  </Field>
                  <Field label="Ngày sinh">
                    <input
                      className={inputClass}
                      defaultValue={dateInputValue(member.studentProfile.dob)}
                      name="dob"
                      type="date"
                    />
                  </Field>
                  <Field label="Trường">
                    <input
                      className={inputClass}
                      defaultValue={member.studentProfile.school ?? ""}
                      name="school"
                    />
                  </Field>
                  <Field label="Đại học">
                    <input
                      className={inputClass}
                      defaultValue={member.studentProfile.university ?? ""}
                      name="university"
                    />
                  </Field>
                  <Field label="Sau đại học / Công việc">
                    <input
                      className={inputClass}
                      defaultValue={member.studentProfile.postGraduateWork ?? ""}
                      name="postGraduateWork"
                    />
                  </Field>
                  <Field label="Mục tiêu tương lai">
                    <input
                      className={inputClass}
                      defaultValue={member.studentProfile.futureGoal ?? ""}
                      name="futureGoal"
                    />
                  </Field>
                </div>

                <div className="mt-4">
                  <Field label="Sở thích">
                    <textarea
                      className={textareaClass}
                      defaultValue={member.studentProfile.hobbies ?? ""}
                      name="hobbies"
                    />
                  </Field>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <ImageField
                    cropName="avatarCrop"
                    defaultCrop={member.studentProfile.avatarCrop}
                    defaultValue={member.studentProfile.avatar}
                    label="Ảnh cá nhân"
                    name="avatar"
                    recommendedSize="800 x 800px"
                  />
                  <ImageField
                    cropName="photoWithTeacherCrop"
                    defaultCrop={member.studentProfile.photoWithTeacherCrop}
                    defaultValue={member.studentProfile.photoWithTeacher}
                    label="Ảnh với thầy"
                    name="photoWithTeacher"
                    recommendedSize="1200 x 900px"
                  />
                  <ImageField
                    cropName="customPhoto1Crop"
                    defaultCrop={member.studentProfile.customPhoto1Crop}
                    defaultValue={member.studentProfile.customPhoto1}
                    label="Ảnh tự chọn 1"
                    name="customPhoto1"
                    recommendedSize="1200 x 900px"
                  />
                  <ImageField
                    cropName="customPhoto2Crop"
                    defaultCrop={member.studentProfile.customPhoto2Crop}
                    defaultValue={member.studentProfile.customPhoto2}
                    label="Ảnh tự chọn 2"
                    name="customPhoto2"
                    recommendedSize="1200 x 900px"
                  />
                  <ImageField
                    cropName="coverImageCrop"
                    defaultCrop={member.studentProfile.coverImageCrop}
                    defaultValue={member.studentProfile.coverImage}
                    label="Ảnh cover"
                    name="coverImage"
                    recommendedSize="1920 x 720px"
                  />
                </div>

                <Field label="Lưu bút ngắn">
                  <textarea
                    className={textareaClass}
                    defaultValue={member.studentProfile.yearbookMessage ?? ""}
                    name="yearbookMessage"
                  />
                </Field>
                <div className="mt-4 rounded-md border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-semibold text-slate-700">Bài viết (blog)</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Tạo hoặc gán bài ở mục bài viết phía trên cho thành viên này.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {team.memoryPosts.some(
                      (post) => post.studentProfileId === member.studentProfile.id,
                    ) ? (
                      team.memoryPosts
                        .filter((post) => post.studentProfileId === member.studentProfile.id)
                        .map((post) => (
                          <span
                            className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700"
                            key={post.id}
                          >
                            {post.title} - {post.publishedAt ? "Public" : "Private"}
                          </span>
                        ))
                    ) : (
                      <span className="text-sm text-slate-500">Chưa có bài viết.</span>
                    )}
                  </div>
                </div>
              </form>
              </details>
            ))}
          </div>
          </section>
        </details>
          </div>
        </div>
      </div>
    </main>
  );
}
