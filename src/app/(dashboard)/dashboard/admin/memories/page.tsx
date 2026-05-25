import { ContentFormat, MemoryPostType } from "@prisma/client";

import {
  AdminPanel,
  AdminShell,
  Field,
  FormGrid,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/admin-shell";
import { ImageField } from "@/components/admin/image-field";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createMemoryPostAction, updateMemoryPostAction } from "../actions";

export const dynamic = "force-dynamic";

function dateTimeValue(date?: Date | null) {
  return date ? date.toISOString().slice(0, 16) : "";
}

export default async function AdminMemoriesPage() {
  await requireAdmin();

  const [classes, teams, profiles, memories] = await Promise.all([
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.team.findMany({ orderBy: [{ year: "desc" }, { category: "asc" }] }),
    prisma.studentProfile.findMany({ orderBy: { fullName: "asc" } }),
    prisma.memoryPost.findMany({
      include: {
        class: { select: { name: true } },
        studentProfile: { select: { fullName: true } },
        team: { select: { category: true, year: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const relationFields = (
    defaults: {
      classId?: string | null;
      studentProfileId?: string | null;
      teamId?: string | null;
    } = {},
  ) => (
    <FormGrid>
      <Field label="Gắn với lớp">
        <select
          className={selectClass}
          defaultValue={defaults.classId ?? "none"}
          name="classId"
        >
          <option value="none">Không gắn lớp</option>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Gắn với học sinh">
        <select
          className={selectClass}
          defaultValue={defaults.studentProfileId ?? "none"}
          name="studentProfileId"
        >
          <option value="none">Không gắn học sinh</option>
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.fullName}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Gắn với đội tuyển">
        <select
          className={selectClass}
          defaultValue={defaults.teamId ?? "none"}
          name="teamId"
        >
          <option value="none">Không gắn đội tuyển</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.category} · {team.year}
            </option>
          ))}
        </select>
      </Field>
    </FormGrid>
  );

  return (
    <AdminShell
      description="Bài giới thiệu lớp, lưu bút học sinh và bài chia sẻ đội tuyển. Nội dung có thể là Markdown hoặc HTML."
      title="Quản lý lưu bút và bài giới thiệu"
    >
      <div className="grid gap-5">
        <AdminPanel title="Thêm bài lưu bút/giới thiệu">
          <form action={createMemoryPostAction} className="space-y-4">
            <FormGrid>
              <Field label="Tiêu đề">
                <input className={inputClass} name="title" required />
              </Field>
              <Field label="Slug">
                <input className={inputClass} name="slug" />
              </Field>
              <Field label="Loại bài">
                <select
                  className={selectClass}
                  defaultValue="CLASS_INTRO"
                  name="type"
                >
                  {Object.values(MemoryPostType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Định dạng">
                <select
                  className={selectClass}
                  defaultValue="MARKDOWN"
                  name="contentFormat"
                >
                  {Object.values(ContentFormat).map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Ngày publish">
                <input className={inputClass} name="publishedAt" type="datetime-local" />
              </Field>
            </FormGrid>
            <FormGrid>
              <ImageField
                cropName="coverImageCrop"
                label="Ảnh cover"
                name="coverImage"
                recommendedSize="1600 x 900px"
              />
              <ImageField
                cropName="backgroundImageCrop"
                label="Ảnh nền card"
                name="backgroundImage"
                recommendedSize="1920 x 1080px"
              />
            </FormGrid>
            {relationFields()}
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input name="published" type="checkbox" />
              Xuất bản
            </label>
            <Field label="Tóm tắt">
              <textarea className={textareaClass} name="excerpt" />
            </Field>
            <Field label="Nội dung">
              <textarea className="min-h-80 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" name="content" required />
            </Field>
            <button
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              type="submit"
            >
              Thêm bài
            </button>
          </form>
        </AdminPanel>

        <AdminPanel title="Bài lưu bút/giới thiệu hiện có">
          <div className="grid gap-4">
            {memories.map((memory) => (
              <form
                action={updateMemoryPostAction}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                key={memory.id}
              >
                <input name="id" type="hidden" value={memory.id} />
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{memory.title}</h3>
                    <p className="text-sm text-slate-500">
                      {memory.type}
                      {memory.class ? ` · ${memory.class.name}` : ""}
                      {memory.studentProfile
                        ? ` · ${memory.studentProfile.fullName}`
                        : ""}
                      {memory.team
                        ? ` · ${memory.team.category} ${memory.team.year}`
                        : ""}
                    </p>
                  </div>
                  <button
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    type="submit"
                  >
                    Lưu bài
                  </button>
                </div>
                <div className="space-y-4">
                  <FormGrid>
                    <Field label="Tiêu đề">
                      <input
                        className={inputClass}
                        defaultValue={memory.title}
                        name="title"
                        required
                      />
                    </Field>
                    <Field label="Slug">
                      <input
                        className={inputClass}
                        defaultValue={memory.slug ?? ""}
                        name="slug"
                      />
                    </Field>
                    <Field label="Loại bài">
                      <select
                        className={selectClass}
                        defaultValue={memory.type}
                        name="type"
                      >
                        {Object.values(MemoryPostType).map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Định dạng">
                      <select
                        className={selectClass}
                        defaultValue={memory.contentFormat}
                        name="contentFormat"
                      >
                        {Object.values(ContentFormat).map((format) => (
                          <option key={format} value={format}>
                            {format}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Ngày publish">
                      <input
                        className={inputClass}
                        defaultValue={dateTimeValue(memory.publishedAt)}
                        name="publishedAt"
                        type="datetime-local"
                      />
                    </Field>
                  </FormGrid>
                  <FormGrid>
                    <ImageField
                      cropName="coverImageCrop"
                      defaultCrop={memory.coverImageCrop}
                      defaultValue={memory.coverImage}
                      label="Ảnh cover"
                      name="coverImage"
                      recommendedSize="1600 x 900px"
                    />
                    <ImageField
                      cropName="backgroundImageCrop"
                      defaultCrop={memory.backgroundImageCrop}
                      defaultValue={memory.backgroundImage}
                      label="Ảnh nền card"
                      name="backgroundImage"
                      recommendedSize="1920 x 1080px"
                    />
                  </FormGrid>
                  {relationFields({
                    classId: memory.classId,
                    studentProfileId: memory.studentProfileId,
                    teamId: memory.teamId,
                  })}
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      defaultChecked={Boolean(memory.publishedAt)}
                      name="published"
                      type="checkbox"
                    />
                    Xuất bản
                  </label>
                  <Field label="Tóm tắt">
                    <textarea
                      className={textareaClass}
                      defaultValue={memory.excerpt ?? ""}
                      name="excerpt"
                    />
                  </Field>
                  <Field label="Nội dung">
                    <textarea
                      className="min-h-80 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      defaultValue={memory.content}
                      name="content"
                      required
                    />
                  </Field>
                </div>
              </form>
            ))}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
