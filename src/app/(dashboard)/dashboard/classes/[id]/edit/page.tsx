import { ContentFormat, MemoryPostType, Role } from "@prisma/client";
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
import { canEditClass } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  assignClassMonitorAction,
  importClassMembersAction,
} from "../../../admin/actions";
import {
  createManagedClassAlbumAction,
  createManagedClassPostAction,
  createManagedClassStudentAction,
  deleteManagedClassAlbumAction,
  deleteManagedClassPostAction,
  removeManagedClassStudentAction,
  updateManagedClassAlbumAction,
  updateManagedClassAction,
  updateManagedClassPostAction,
  updateManagedClassStudentAction,
} from "../../../managed-actions";

export const dynamic = "force-dynamic";

function dateInputValue(value?: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function EditClassPage({
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
  const [classroom, monitorUsers, playlists] = await Promise.all([
    prisma.class.findFirst({
      include: {
        albums: {
          include: { items: { orderBy: { sortOrder: "asc" } } },
          orderBy: { sortOrder: "asc" },
        },
        memoryPosts: {
          include: { media: { orderBy: { sortOrder: "asc" } } },
          orderBy: { updatedAt: "desc" },
        },
        students: {
          include: { profile: true },
          orderBy: { name: "asc" },
        },
      },
      where: {
        OR: [{ id }, { slug: id }],
      },
    }),
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

  if (!classroom || !canEditClass(session.user, classroom)) {
    redirect("/dashboard");
  }

  const introductionPosts = classroom.memoryPosts.filter(
    (post) => post.type === MemoryPostType.CLASS_INTRO,
  );
  const storyPosts = classroom.memoryPosts.filter(
    (post) => post.type !== MemoryPostType.CLASS_INTRO,
  );

  const postEditor = (post: (typeof classroom.memoryPosts)[number]) => (
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
      action={updateManagedClassPostAction}
      className="border-t border-slate-200 p-4"
    >
      <input name="classId" type="hidden" value={classroom.id} />
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
            formAction={deleteManagedClassPostAction}
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
        <Field label="Nhóm bài">
          <select className={selectClass} defaultValue={post.type} name="type">
            <option value={MemoryPostType.CLASS_INTRO}>Bài viết giới thiệu</option>
            <option value={MemoryPostType.CLASS_STORY}>Lưu bút / Chia sẻ</option>
          </select>
        </Field>
        <Field label="Tác giả / học sinh liên quan">
          <select
            className={selectClass}
            defaultValue={post.studentProfileId ?? "none"}
            name="studentProfileId"
          >
            <option value="none">Bài chung của lớp</option>
            {classroom.students
              .filter((student) => student.profile)
              .map((student) => (
                <option key={student.profile!.id} value={student.profile!.id}>
                  {student.profile!.fullName}
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
          href={session.user.role === Role.ADMIN ? "/dashboard/admin/classes" : "/dashboard"}
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Quay lại danh sách lớp
        </Link>

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase text-emerald-700">
            Chỉnh sửa lớp
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold">{classroom.name}</h1>
              <p className="mt-2 text-sm text-slate-500">
                Lớp trưởng có thể chỉnh thông tin lớp, thành viên và bài viết
                trong lớp này.
              </p>
            </div>
            <Link
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              href={`/${classroom.slug}`}
            >
              Xem trang lớp
            </Link>
          </div>
        </section>
        <ActionFeedback message={feedback.message} status={feedback.status} />

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[210px_minmax(0,1fr)]">
          <EditorNavigation
            items={[
              { href: "#class-information", label: "Thông tin lớp" },
              { href: "#class-albums", label: "Album" },
              { href: "#class-import", label: "Phân công / Import" },
              { href: "#class-posts", label: "Bài viết" },
              { href: "#class-members", label: "Thành viên" },
            ]}
          />
          <div className="grid gap-5">
        <details
          className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          id="class-information"
          open
        >
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-slate-900 hover:bg-slate-50">
            Thông tin lớp
            <span className="text-xs font-medium text-slate-500">Thu gọn / Mở rộng</span>
          </summary>
          <form
            action={updateManagedClassAction}
            className="border-t border-slate-200 p-5"
          >
          <input name="classId" type="hidden" value={classroom.id} />
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Thông tin lớp</h2>
              <p className="mt-1 text-sm text-slate-500">
                Phần giới thiệu có thể viết ngắn tại đây; các bài dài, có ảnh,
                video, audio nên tạo trong mục bài viết bên dưới.
              </p>
            </div>
            <button
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              type="submit"
            >
              Lưu lớp
            </button>
          </div>

          <FormGrid>
            <Field label="Tên lớp">
              <input
                className={inputClass}
                defaultValue={classroom.name}
                name="name"
                required
              />
            </Field>
            <Field label="Slug">
              <input
                className={inputClass}
                defaultValue={classroom.slug}
                name="slug"
              />
            </Field>
            <Field label="Slogan">
              <input
                className={inputClass}
                defaultValue={classroom.slogan ?? ""}
                name="slogan"
              />
            </Field>
            <Field label="Link media ngoài">
              <input
                className={inputClass}
                defaultValue={classroom.externalMediaUrl ?? ""}
                name="externalMediaUrl"
                placeholder="Google Drive, Flickr, YouTube playlist..."
              />
            </Field>
          </FormGrid>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ImageField
              cropName="coverImageCrop"
              defaultCrop={classroom.coverImageCrop}
              defaultValue={classroom.coverImage}
              label="Ảnh bìa lớp"
              name="coverImage"
              recommendedSize="1920 x 720px"
            />
            <ImageField
              cropName="cardBackgroundImageCrop"
              defaultCrop={classroom.cardBackgroundImageCrop}
              defaultValue={classroom.cardBackgroundImage}
              label="Ảnh nền block/card lớp"
              name="cardBackgroundImage"
              recommendedSize="1200 x 800px"
            />
          </div>

          <div className="mt-4 grid gap-4">
            <Field label="Giới thiệu ngắn">
              <textarea
                className={textareaClass}
                defaultValue={classroom.introduction ?? ""}
                name="introduction"
              />
            </Field>
            <Field label="Thành tích">
              <textarea
                className={textareaClass}
                defaultValue={classroom.achievements ?? ""}
                name="achievements"
              />
            </Field>
          </div>
          <ImageStandards />
          </form>
        </details>

        <details
          className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          id="class-albums"
          open
        >
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-slate-900 hover:bg-slate-50">
            Album lớp học
            <span className="text-xs font-medium text-slate-500">Thu gọn / Mở rộng</span>
          </summary>
          <section className="border-t border-slate-200 p-5">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Quản lý Album</h2>
              <p className="mt-1 text-sm text-slate-500">
                Album được hiển thị trên trang lớp, hỗ trợ slideshow ảnh/video, folder Drive và nhạc nền đã chọn.
              </p>
            </div>
            <AlbumManager
              albums={classroom.albums}
              createAction={createManagedClassAlbumAction}
              deleteAction={deleteManagedClassAlbumAction}
              ownerId={classroom.id}
              ownerKey="classId"
              playlists={playlists}
              updateAction={updateManagedClassAlbumAction}
            />
          </section>
        </details>

        {session.user.role === Role.ADMIN ? (
          <details
            className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            id="class-import"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-slate-900 hover:bg-slate-50">
              Phân công và import thành viên
              <span className="text-xs font-medium text-slate-500">Thu gọn / Mở rộng</span>
            </summary>
            <section className="border-t border-slate-200 p-5">
            <h2 className="text-xl font-semibold">Phân công và import thành viên</h2>
            <p className="mt-1 text-sm text-slate-500">
              Chỉ admin có thể chọn lớp trưởng hoặc import danh sách CSV cho lớp này.
            </p>
            <form
              action={assignClassMonitorAction}
              className="mt-4 flex flex-wrap items-end gap-3"
            >
              <input name="classId" type="hidden" value={classroom.id} />
              <Field label="Lớp trưởng">
                <select
                  className={selectClass}
                  defaultValue={classroom.monitorId ?? "none"}
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
            <form action={importClassMembersAction} className="mt-5 flex flex-wrap items-end gap-3">
              <input name="classId" type="hidden" value={classroom.id} />
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
          id="class-posts"
          open
        >
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-slate-900 hover:bg-slate-50">
            Bài viết trong lớp
            <span className="text-xs font-medium text-slate-500">Thu gọn / Mở rộng</span>
          </summary>
          <section className="border-t border-slate-200 p-5">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Bài viết trong lớp</h2>
            <p className="mt-1 text-sm text-slate-500">
              Dùng Markdown hoặc HTML để chèn ảnh, video YouTube, link Google
              Drive, audio hoặc nội dung lưu bút dài.
            </p>
          </div>

          <div className="grid gap-6">
            <div>
              <h3 className="mb-3 text-lg font-semibold">Bài viết giới thiệu</h3>
              <div className="grid gap-4">
                {introductionPosts.length ? (
                  introductionPosts.map(postEditor)
                ) : (
                  <p className="text-sm text-slate-500">Chưa có bài giới thiệu.</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold">Lưu bút / Bài viết và chia sẻ</h3>
              <div className="grid gap-4">
                {storyPosts.length ? (
                  storyPosts.map(postEditor)
                ) : (
                  <p className="text-sm text-slate-500">Chưa có bài chia sẻ.</p>
                )}
              </div>
            </div>
          </div>

          <form
            action={createManagedClassPostAction}
            className="mt-8 grid gap-4 rounded-md border border-emerald-200 bg-emerald-50/50 p-4"
          >
            <input name="classId" type="hidden" value={classroom.id} />
            <h3 className="text-lg font-semibold">Thêm bài viết mới</h3>
            <FormGrid>
              <Field label="Tiêu đề">
                <input className={inputClass} name="title" required />
              </Field>
              <Field label="Nhóm bài">
                <select className={selectClass} defaultValue={MemoryPostType.CLASS_STORY} name="type">
                  <option value={MemoryPostType.CLASS_INTRO}>Bài viết giới thiệu</option>
                  <option value={MemoryPostType.CLASS_STORY}>Lưu bút / Chia sẻ</option>
                </select>
              </Field>
              <Field label="Tác giả / học sinh liên quan">
                <select className={selectClass} defaultValue="none" name="studentProfileId">
                  <option value="none">Bài chung của lớp</option>
                  {classroom.students
                    .filter((student) => student.profile)
                    .map((student) => (
                      <option key={student.profile!.id} value={student.profile!.id}>
                        {student.profile!.fullName}
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
          id="class-members"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-slate-900 hover:bg-slate-50">
            Thành viên lớp
            <span className="text-xs font-medium text-slate-500">Thu gọn / Mở rộng</span>
          </summary>
          <section className="border-t border-slate-200 p-5">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Thành viên lớp</h2>
            <p className="mt-1 text-sm text-slate-500">
              Các ảnh cá nhân dùng URL công khai hoặc link Google Drive đã bật
              chia sẻ. Ảnh chính nên vuông; ảnh bìa nên rộng ngang.
            </p>
          </div>

          <form
            action={createManagedClassStudentAction}
            className="mb-6 rounded-md border border-slate-200 bg-slate-50 p-4"
          >
            <h3 className="font-semibold">Thêm nhanh thành viên</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input name="classId" type="hidden" value={classroom.id} />
              <input
                className={inputClass}
                name="email"
                placeholder="Email"
                required
              />
              <input
                className={inputClass}
                name="fullName"
                placeholder="Họ và tên"
                required
              />
              <input
                className={inputClass}
                name="nickname"
                placeholder="Nickname"
              />
              <input
                className={inputClass}
                name="school"
                placeholder="Trường"
              />
            </div>
            <button
              className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              type="submit"
            >
              Thêm thành viên
            </button>
          </form>

          <div className="grid gap-4">
            {classroom.students.map((student) => (
              <details
                className="overflow-hidden rounded-md border border-slate-200 bg-slate-50"
                key={student.id}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-slate-800 hover:bg-slate-100">
                  {student.profile?.fullName ?? student.name ?? student.email}
                  <span className="text-xs font-medium text-slate-500">Mở thông tin</span>
                </summary>
              <form
                action={updateManagedClassStudentAction}
                className="border-t border-slate-200 p-4"
              >
                <input name="classId" type="hidden" value={classroom.id} />
                <input name="userId" type="hidden" value={student.id} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-semibold">
                    {student.profile?.fullName ?? student.name ?? student.email}
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
                      formAction={removeManagedClassStudentAction}
                      formNoValidate
                      type="submit"
                    >
                      Xóa khỏi lớp
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Họ và tên">
                    <input
                      className={inputClass}
                      defaultValue={student.profile?.fullName ?? student.name ?? ""}
                      name="fullName"
                      required
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      className={inputClass}
                      defaultValue={student.email}
                      name="email"
                      required
                      type="email"
                    />
                  </Field>
                  <Field label="Lớp">
                    <input
                      className={`${inputClass} bg-slate-100 text-slate-600`}
                      readOnly
                      value={classroom.name}
                    />
                  </Field>
                  <Field label="Nickname">
                    <input
                      className={inputClass}
                      defaultValue={student.profile?.nickname ?? ""}
                      name="nickname"
                    />
                  </Field>
                  <Field label="Ngày sinh">
                    <input
                      className={inputClass}
                      defaultValue={dateInputValue(student.profile?.dob)}
                      name="dob"
                      type="date"
                    />
                  </Field>
                  <Field label="Trường">
                    <input
                      className={inputClass}
                      defaultValue={student.profile?.school ?? ""}
                      name="school"
                    />
                  </Field>
                  <Field label="Đại học">
                    <input
                      className={inputClass}
                      defaultValue={student.profile?.university ?? ""}
                      name="university"
                    />
                  </Field>
                  <Field label="Sau đại học / Công việc">
                    <input
                      className={inputClass}
                      defaultValue={student.profile?.postGraduateWork ?? ""}
                      name="postGraduateWork"
                    />
                  </Field>
                  <Field label="Mục tiêu tương lai">
                    <input
                      className={inputClass}
                      defaultValue={student.profile?.futureGoal ?? ""}
                      name="futureGoal"
                    />
                  </Field>
                </div>

                <div className="mt-4">
                  <Field label="Sở thích">
                    <textarea
                      className={textareaClass}
                      defaultValue={student.profile?.hobbies ?? ""}
                      name="hobbies"
                    />
                  </Field>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <ImageField
                    cropName="avatarCrop"
                    defaultCrop={student.profile?.avatarCrop}
                    defaultValue={student.profile?.avatar}
                    label="Ảnh cá nhân"
                    name="avatar"
                    recommendedSize="800 x 800px"
                  />
                  <ImageField
                    cropName="photoWithTeacherCrop"
                    defaultCrop={student.profile?.photoWithTeacherCrop}
                    defaultValue={student.profile?.photoWithTeacher}
                    label="Ảnh với thầy"
                    name="photoWithTeacher"
                    recommendedSize="1200 x 900px"
                  />
                  <ImageField
                    cropName="customPhoto1Crop"
                    defaultCrop={student.profile?.customPhoto1Crop}
                    defaultValue={student.profile?.customPhoto1}
                    label="Ảnh tự chọn 1"
                    name="customPhoto1"
                    recommendedSize="1200 x 900px"
                  />
                  <ImageField
                    cropName="customPhoto2Crop"
                    defaultCrop={student.profile?.customPhoto2Crop}
                    defaultValue={student.profile?.customPhoto2}
                    label="Ảnh tự chọn 2"
                    name="customPhoto2"
                    recommendedSize="1200 x 900px"
                  />
                  <ImageField
                    cropName="coverImageCrop"
                    defaultCrop={student.profile?.coverImageCrop}
                    defaultValue={student.profile?.coverImage}
                    label="Ảnh cover"
                    name="coverImage"
                    recommendedSize="1920 x 720px"
                  />
                </div>

                <Field label="Lưu bút ngắn">
                  <textarea
                    className={textareaClass}
                    defaultValue={student.profile?.yearbookMessage ?? ""}
                    name="yearbookMessage"
                  />
                </Field>
                <div className="mt-4 rounded-md border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-semibold text-slate-700">Bài viết (blog)</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Tạo hoặc gán bài ở mục bài viết phía trên cho học sinh này.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {student.profile &&
                    classroom.memoryPosts.some(
                      (post) => post.studentProfileId === student.profile?.id,
                    ) ? (
                      classroom.memoryPosts
                        .filter((post) => post.studentProfileId === student.profile?.id)
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
