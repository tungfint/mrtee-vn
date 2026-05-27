import "dotenv/config";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {
  ContentFormat,
  MediaType,
  MemoryPostType,
  PrismaClient,
  Role,
  TeamCategory,
} from "@prisma/client";
import bcrypt from "bcryptjs";

import { mariaDbAdapterConfig } from "./database-url.mjs";

const TEST_PASSWORD = "Mrtee@2026";

const adapter = new PrismaMariaDb(mariaDbAdapterConfig(process.env.DATABASE_URL));

const prisma = new PrismaClient({ adapter });

async function upsertUser({ email, name, role, classId }) {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);

  return prisma.user.upsert({
    where: { email },
    update: {
      classId,
      name,
      passwordHash,
      role,
    },
    create: {
      classId,
      email,
      name,
      passwordHash,
      role,
    },
  });
}

async function resetMedia(memoryPostId, media) {
  await prisma.mediaAsset.deleteMany({
    where: { memoryPostId },
  });

  if (!media.length) {
    return;
  }

  await prisma.mediaAsset.createMany({
    data: media.map((item, index) => ({
      ...item,
      memoryPostId,
      sortOrder: index,
    })),
  });
}

async function main() {
  const tin2023 = await prisma.class.upsert({
    where: { slug: "tin2023" },
    update: {
      cardBackgroundImage:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
      coverImage:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=80",
      name: "Tin2023",
      slogan: "Code có thể sai rồi sửa, nhưng thanh xuân thì phải lưu lại thật đẹp.",
    },
    create: {
      cardBackgroundImage:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
      coverImage:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=80",
      name: "Tin2023",
      slug: "tin2023",
      slogan: "Code có thể sai rồi sửa, nhưng thanh xuân thì phải lưu lại thật đẹp.",
    },
  });

  await prisma.class.upsert({
    where: { slug: "tin2326" },
    update: {
      name: "Tin2326",
      slogan: "Học thật, làm thật, lưu giữ thật.",
    },
    create: {
      name: "Tin2326",
      slug: "tin2326",
      slogan: "Học thật, làm thật, lưu giữ thật.",
    },
  });

  await upsertUser({
    email: "admin@mrtee.vn",
    name: "Thầy Tee",
    role: Role.ADMIN,
  });

  const monitor = await upsertUser({
    classId: tin2023.id,
    email: "monitor.tin2023@mrtee.vn",
    name: "Lớp trưởng Tin2023",
    role: Role.MONITOR,
  });

  const student = await upsertUser({
    classId: tin2023.id,
    email: "student.tin2023@mrtee.vn",
    name: "Nguyễn Minh Anh",
    role: Role.STUDENT,
  });

  await prisma.class.update({
    where: { id: tin2023.id },
    data: { monitorId: monitor.id },
  });

  const monitorProfile = await prisma.studentProfile.upsert({
    where: { userId: monitor.id },
    update: {
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
      fullName: "Trần Quốc Bảo",
      nickname: "BaoJS",
    },
    create: {
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
      fullName: "Trần Quốc Bảo",
      nickname: "BaoJS",
      userId: monitor.id,
    },
  });

  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
      customPhoto1:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
      customPhoto2:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      dob: new Date("2008-08-12T00:00:00.000Z"),
      fullName: "Nguyễn Minh Anh",
      futureGoal: "Khoa học máy tính - Đại học Bách khoa",
      hobbies: "Thiết kế web, chụp ảnh, đọc truyện khoa học viễn tưởng",
      nickname: "Min",
      photoWithTeacher:
        "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=80",
      yearbookMessage:
        "Cảm ơn thầy và cả lớp vì những ngày học Tin rất đáng nhớ.",
    },
    create: {
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
      customPhoto1:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
      customPhoto2:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      dob: new Date("2008-08-12T00:00:00.000Z"),
      fullName: "Nguyễn Minh Anh",
      futureGoal: "Khoa học máy tính - Đại học Bách khoa",
      hobbies: "Thiết kế web, chụp ảnh, đọc truyện khoa học viễn tưởng",
      nickname: "Min",
      photoWithTeacher:
        "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=80",
      userId: student.id,
      yearbookMessage:
        "Cảm ơn thầy và cả lớp vì những ngày học Tin rất đáng nhớ.",
    },
  });

  const team = await prisma.team.upsert({
    where: {
      category_year: {
        category: TeamCategory.HSG_TIN,
        year: 2025,
      },
    },
    update: {
      achievements: "Giải khuyến khích cấp tỉnh, hoàn thành bộ đề luyện tập 2025.",
      backgroundImage:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
      cardBackgroundImage:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      description: "Đội tuyển học sinh giỏi Tin học năm 2025.",
      galleryImages: [
        "https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=1200&q=80",
      ],
      introContent:
        "Năm 2025, đội tiếp tục rèn thuật toán và chia sẻ cách giải qua từng buổi review code.",
      monitorId: monitor.id,
    },
    create: {
      achievements: "Giải khuyến khích cấp tỉnh, hoàn thành bộ đề luyện tập 2025.",
      backgroundImage:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
      cardBackgroundImage:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      category: TeamCategory.HSG_TIN,
      description: "Đội tuyển học sinh giỏi Tin học năm 2025.",
      galleryImages: [
        "https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=1200&q=80",
      ],
      introContent:
        "Năm 2025, đội tiếp tục rèn thuật toán và chia sẻ cách giải qua từng buổi review code.",
      monitorId: monitor.id,
      year: 2025,
    },
  });

  const additionalTeams = [];
  for (const data of [
    {
      achievements:
        "- Hoàn thành chuyên đề đồ thị và quy hoạch động.\n- Có học sinh vào vòng thi cấp tỉnh.",
      backgroundImage:
        "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1800&q=80",
      cardBackgroundImage:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      description: "Hành trình HSG Tin năm 2024: xây nền thuật toán thật chắc.",
      galleryImages: [
        "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
      ],
      introContent:
        "Năm đầu của hành trình lưu bút đội tuyển: cùng học, cùng sửa code và cùng tiến bộ.",
      year: 2024,
    },
    {
      achievements:
        "- Khởi động lộ trình luyện thi 2026.\n- Xây dựng thư viện bài giải và buổi chia sẻ nội bộ.",
      backgroundImage:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1800&q=80",
      cardBackgroundImage:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      description: "Đội tuyển học sinh giỏi Tin học năm 2026.",
      galleryImages: [
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
      ],
      introContent:
        "HSG Tin 2026 là nơi các bạn thử thách bản thân với thuật toán, dự án nhỏ và những buổi học rất tập trung.",
      year: 2026,
    },
  ]) {
    const seededTeam = await prisma.team.upsert({
      where: {
        category_year: {
          category: TeamCategory.HSG_TIN,
          year: data.year,
        },
      },
      create: {
        ...data,
        category: TeamCategory.HSG_TIN,
        monitorId: monitor.id,
      },
      update: {
        ...data,
        monitorId: monitor.id,
      },
    });

    additionalTeams.push(seededTeam);
  }

  for (const hsgTeam of [team, ...additionalTeams]) {
    for (const profile of [monitorProfile, studentProfile]) {
      await prisma.teamMember.upsert({
        where: {
          teamId_studentProfileId: {
            studentProfileId: profile.id,
            teamId: hsgTeam.id,
          },
        },
        update: {
          role: profile.id === studentProfile.id ? "Algorithm" : "Web/Robot",
        },
        create: {
          role: profile.id === studentProfile.id ? "Algorithm" : "Web/Robot",
          studentProfileId: profile.id,
          teamId: hsgTeam.id,
        },
      });
    }
  }

  const classIntro = await prisma.memoryPost.upsert({
    where: { slug: "tin2023-gioi-thieu" },
    update: {
      classId: tin2023.id,
      content:
        "Tin2023 là một góc nhỏ rất nhiều tiếng cười, những buổi chạy deadline dự án và các tiết Tin đáng nhớ.",
      contentFormat: ContentFormat.MARKDOWN,
      publishedAt: new Date(),
      title: "Những ngày xanh của Tin2023",
      type: MemoryPostType.CLASS_INTRO,
    },
    create: {
      classId: tin2023.id,
      content:
        "Tin2023 là một góc nhỏ rất nhiều tiếng cười, những buổi chạy deadline dự án và các tiết Tin đáng nhớ.",
      contentFormat: ContentFormat.MARKDOWN,
      publishedAt: new Date(),
      slug: "tin2023-gioi-thieu",
      title: "Những ngày xanh của Tin2023",
      type: MemoryPostType.CLASS_INTRO,
    },
  });

  await resetMedia(classIntro.id, [
    {
      title: "Khoảnh khắc lớp học",
      type: MediaType.IMAGE,
      url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Thư mục ảnh kỷ niệm",
      type: MediaType.LINK,
      url: "https://drive.google.com",
    },
  ]);

  const studentMemory = await prisma.memoryPost.upsert({
    where: { slug: "minh-anh-luu-but-1" },
    update: {
      authorId: student.id,
      content:
        "Em nhớ nhất là những buổi cả nhóm ở lại sửa project đến khi trời tối.",
      contentFormat: ContentFormat.MARKDOWN,
      publishedAt: new Date(),
      studentProfileId: studentProfile.id,
      title: "Một buổi chiều ở phòng Tin",
      type: MemoryPostType.STUDENT_YEARBOOK,
    },
    create: {
      authorId: student.id,
      content:
        "Em nhớ nhất là những buổi cả nhóm ở lại sửa project đến khi trời tối.",
      contentFormat: ContentFormat.MARKDOWN,
      publishedAt: new Date(),
      slug: "minh-anh-luu-but-1",
      studentProfileId: studentProfile.id,
      title: "Một buổi chiều ở phòng Tin",
      type: MemoryPostType.STUDENT_YEARBOOK,
    },
  });

  await resetMedia(studentMemory.id, [
    {
      title: "Góc làm project",
      type: MediaType.IMAGE,
      url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    },
  ]);

  await prisma.memoryPost.upsert({
    where: { slug: "hsg-tin-2025-ngay-dau" },
    update: {
      content:
        "Buổi đầu tiên vào đội tuyển luôn hồi hộp, nhưng cả nhóm nhanh chóng tìm được nhịp làm việc chung.",
      contentFormat: ContentFormat.MARKDOWN,
      publishedAt: new Date(),
      teamId: team.id,
      title: "Ngày đầu vào đội tuyển",
      type: MemoryPostType.TEAM_STORY,
    },
    create: {
      content:
        "Buổi đầu tiên vào đội tuyển luôn hồi hộp, nhưng cả nhóm nhanh chóng tìm được nhịp làm việc chung.",
      contentFormat: ContentFormat.MARKDOWN,
      publishedAt: new Date(),
      slug: "hsg-tin-2025-ngay-dau",
      teamId: team.id,
      title: "Ngày đầu vào đội tuyển",
      type: MemoryPostType.TEAM_STORY,
    },
  });

  for (const hsgTeam of additionalTeams) {
    await prisma.memoryPost.upsert({
      where: { slug: `hsg-tin-${hsgTeam.year}-chia-se` },
      update: {
        content:
          hsgTeam.year === 2024
            ? "Một mùa luyện đề chăm chỉ, nơi mỗi lỗi sai trở thành một ghi chú có ích cho buổi học kế tiếp."
            : "Chúng em bắt đầu năm 2026 bằng mục tiêu rõ ràng: hiểu sâu hơn, giải bài chắc hơn và giúp nhau tiến bộ.",
        contentFormat: ContentFormat.MARKDOWN,
        publishedAt: new Date(),
        teamId: hsgTeam.id,
        title: `Lưu bút HSG Tin ${hsgTeam.year}`,
        type: MemoryPostType.TEAM_STORY,
      },
      create: {
        content:
          hsgTeam.year === 2024
            ? "Một mùa luyện đề chăm chỉ, nơi mỗi lỗi sai trở thành một ghi chú có ích cho buổi học kế tiếp."
            : "Chúng em bắt đầu năm 2026 bằng mục tiêu rõ ràng: hiểu sâu hơn, giải bài chắc hơn và giúp nhau tiến bộ.",
        contentFormat: ContentFormat.MARKDOWN,
        publishedAt: new Date(),
        slug: `hsg-tin-${hsgTeam.year}-chia-se`,
        teamId: hsgTeam.id,
        title: `Lưu bút HSG Tin ${hsgTeam.year}`,
        type: MemoryPostType.TEAM_STORY,
      },
    });
  }

  console.log("Seeded mrtee.vn test data.");
  console.table([
    { email: "admin@mrtee.vn", password: TEST_PASSWORD, role: "ADMIN" },
    {
      email: "monitor.tin2023@mrtee.vn",
      password: TEST_PASSWORD,
      role: "MONITOR",
    },
    {
      email: "student.tin2023@mrtee.vn",
      password: TEST_PASSWORD,
      role: "STUDENT",
    },
  ]);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
