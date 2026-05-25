import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  ContentFormat,
  MediaType,
  MemoryPostType,
  PrismaClient,
  Role,
  TeamCategory,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const images = {
  classroom:
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
  collaboration:
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
  coding:
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1600&q=80",
  robotics:
    "https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=1600&q=80",
  study:
    "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80",
  presentation:
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=80",
};

const sampleVideo =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
const sampleAudio =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";

async function setMedia(postId, media) {
  await prisma.mediaAsset.deleteMany({ where: { memoryPostId: postId } });
  await prisma.mediaAsset.createMany({
    data: media.map((item, sortOrder) => ({
      ...item,
      memoryPostId: postId,
      sortOrder,
    })),
  });
}

async function memoryPost(data, media = []) {
  const post = await prisma.memoryPost.upsert({
    where: { slug: data.slug },
    create: {
      ...data,
      contentFormat: ContentFormat.MARKDOWN,
      publishedAt: new Date(),
    },
    update: {
      ...data,
      contentFormat: ContentFormat.MARKDOWN,
      publishedAt: new Date(),
    },
  });

  await setMedia(post.id, media);
  return post;
}

async function demoStudent({ classroom, email, fullName, nickname, avatar }) {
  const passwordHash = await bcrypt.hash("Mrtee@2026", 12);
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      classId: classroom.id,
      email,
      name: fullName,
      passwordHash,
      role: Role.STUDENT,
    },
    update: {
      classId: classroom.id,
      name: fullName,
    },
  });

  return prisma.studentProfile.upsert({
    where: { userId: user.id },
    create: {
      avatar,
      coverImage: images.collaboration,
      fullName,
      nickname,
      school: "THPT mrtee.vn",
      userId: user.id,
      yearbookMessage: "Một hành trình học tập nhiều niềm vui và trải nghiệm đáng nhớ.",
    },
    update: {
      avatar,
      coverImage: images.collaboration,
      fullName,
      nickname,
      school: "THPT mrtee.vn",
    },
  });
}

async function main() {
  const tin2023 = await prisma.class.findUniqueOrThrow({ where: { slug: "tin2023" } });
  const existingTin2326 = await prisma.class.findUnique({ where: { slug: "tin2326" } });
  const tin2326 = await prisma.class.upsert({
    where: { slug: "tin2326" },
    create: {
      achievements: "- Hoàn thành dự án website đầu tiên.\n- Tổ chức ngày hội STEM trong lớp.",
      cardBackgroundImage: images.collaboration,
      coverImage: images.classroom,
      introduction: "Tin2326 là không gian để học sinh khám phá công nghệ và giữ lại những ký ức tuổi học trò.",
      name: "Tin2326",
      slug: "tin2326",
      slogan: "Học thật, làm thật, lưu giữ thật.",
    },
    update: {
      achievements:
        existingTin2326?.achievements ??
        "- Hoàn thành dự án website đầu tiên.\n- Tổ chức ngày hội STEM trong lớp.",
      cardBackgroundImage: existingTin2326?.cardBackgroundImage ?? images.collaboration,
      coverImage: existingTin2326?.coverImage ?? images.classroom,
      introduction:
        existingTin2326?.introduction ??
        "Tin2326 là không gian để học sinh khám phá công nghệ và giữ lại những ký ức tuổi học trò.",
    },
  });

  const tin2326Profiles = await Promise.all([
    demoStudent({
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      classroom: tin2326,
      email: "lan.tin2326@mrtee.vn",
      fullName: "Lê Ngọc Lan",
      nickname: "Lani",
    }),
    demoStudent({
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
      classroom: tin2326,
      email: "long.tin2326@mrtee.vn",
      fullName: "Phạm Đức Long",
      nickname: "LongPy",
    }),
  ]);

  const classPosts = [
    {
      classId: tin2023.id,
      content: "Buổi học dự án đầu tiên bắt đầu bằng một trang trắng và kết thúc bằng những website nhỏ mà cả lớp đều tự hào.\n\n## Điều chúng em học được\n\n- Chia công việc thành từng bước nhỏ.\n- Cùng sửa lỗi thay vì ngại sai.\n- Lưu lại sản phẩm như một phần của kỷ niệm.",
      coverImage: images.coding,
      excerpt: "Những website đầu tiên và buổi chiều cả nhóm cùng sửa code đến phút cuối.",
      slug: "tin2023-du-an-web-dau-tien",
      title: "Dự án web đầu tiên",
      type: MemoryPostType.CLASS_STORY,
      media: [
        { title: "Góc coding", type: MediaType.IMAGE, url: images.coding },
        { title: "Clip trình diễn", type: MediaType.VIDEO, url: sampleVideo },
      ],
    },
    {
      classId: tin2023.id,
      content: "Ngày chụp ảnh tập thể luôn ồn ào nhưng rất đáng nhớ. Mỗi bức ảnh là một dấu chấm nhỏ trong hành trình lớn của Tin2023.",
      coverImage: images.collaboration,
      excerpt: "Một buổi chụp ảnh, rất nhiều tiếng cười và một album để trở lại sau này.",
      slug: "tin2023-album-ngay-tong-ket",
      title: "Ngày tổng kết qua ống kính",
      type: MemoryPostType.CLASS_STORY,
      media: [
        { title: "Ảnh tập thể", type: MediaType.IMAGE, url: images.collaboration },
        { title: "Nhạc nền album", type: MediaType.AUDIO, url: sampleAudio },
      ],
    },
    {
      classId: tin2023.id,
      content: "Cảm ơn thầy vì đã cho chúng em thử những ý tưởng mới, cả khi chúng chưa hoàn hảo. Phòng Tin đã trở thành một nơi thật thân thuộc.",
      coverImage: images.classroom,
      excerpt: "Một lời cảm ơn dành cho thầy và căn phòng có rất nhiều ký ức.",
      slug: "tin2023-loi-cam-on-thay",
      title: "Gửi thầy từ Tin2023",
      type: MemoryPostType.CLASS_STORY,
      media: [{ title: "Phòng học", type: MediaType.IMAGE, url: images.classroom }],
    },
    {
      classId: tin2326.id,
      content: "Tin2326 khởi đầu bằng sự tò mò: một dòng lệnh, một mô hình nhỏ, một trang web đầu tay. Mỗi tuần, lớp lưu lại thêm một câu chuyện mới.",
      coverImage: images.classroom,
      excerpt: "Nơi hành trình công nghệ của Tin2326 bắt đầu.",
      slug: "tin2326-gioi-thieu",
      title: "Chào Tin2326",
      type: MemoryPostType.CLASS_INTRO,
      media: [{ title: "Lớp học", type: MediaType.IMAGE, url: images.classroom }],
    },
    {
      classId: tin2326.id,
      content: "Chúng em đã tự chia nhóm để thiết kế một trang giới thiệu lớp. Thành quả còn đơn giản, nhưng việc cùng làm nên một sản phẩm thật khiến ai cũng vui.",
      coverImage: images.coding,
      excerpt: "Sản phẩm đầu tay của lớp và những lần chỉnh giao diện cùng nhau.",
      slug: "tin2326-san-pham-dau-tay",
      title: "Sản phẩm số đầu tay",
      type: MemoryPostType.CLASS_STORY,
      media: [{ title: "Thực hành", type: MediaType.IMAGE, url: images.coding }],
    },
    {
      classId: tin2326.id,
      content: "Một buổi STEM, các nhóm mang ý tưởng từ giấy lên màn hình, trình bày trước lớp và góp ý cho nhau.",
      coverImage: images.presentation,
      excerpt: "Những bài trình bày đầu tiên và sự tự tin lớn dần.",
      slug: "tin2326-ngay-hoi-stem",
      title: "Ngày hội STEM",
      type: MemoryPostType.CLASS_STORY,
      media: [
        { title: "Trình bày dự án", type: MediaType.IMAGE, url: images.presentation },
        { title: "Video minh họa", type: MediaType.VIDEO, url: sampleVideo },
      ],
    },
  ];

  for (const item of classPosts) {
    const { media, ...post } = item;
    await memoryPost(post, media);
  }

  const monitor = await prisma.user.findUnique({ where: { email: "monitor.tin2023@mrtee.vn" } });
  const sharedProfiles = await prisma.studentProfile.findMany({
    take: 4,
    where: { user: { email: { in: ["monitor.tin2023@mrtee.vn", "student.tin2023@mrtee.vn"] } } },
  });

  const teamSpecs = [
    {
      category: TeamCategory.FTC,
      year: 2025,
      description: "FTC Robotics 2025: chế tạo, thử nghiệm và tinh chỉnh robot qua từng vòng chạy.",
      introContent: "Từ bản phác thảo đầu tiên đến robot có thể vận hành, đội FTC học cách làm việc có kế hoạch và kiên trì cải tiến.",
      achievements: "- Hoàn thành robot thi đấu thử nghiệm.\n- Trình diễn trong ngày hội STEM.",
      backgroundImage: images.robotics,
      cardBackgroundImage: images.collaboration,
    },
    {
      category: TeamCategory.AI,
      year: 2026,
      description: "AI Lab 2026: khám phá dữ liệu, mô hình và cách ứng dụng AI có trách nhiệm.",
      introContent: "Nhóm AI bắt đầu từ các bài toán gần gũi: phân loại ảnh, kể chuyện bằng dữ liệu và thảo luận về sử dụng công nghệ đúng cách.",
      achievements: "- Hoàn thành mini project nhận diện hình ảnh.\n- Có buổi báo cáo nội bộ đầu tiên.",
      backgroundImage: images.presentation,
      cardBackgroundImage: images.coding,
    },
  ];

  const allTeams = await prisma.team.findMany({ where: { category: TeamCategory.HSG_TIN } });
  for (const spec of teamSpecs) {
    const team = await prisma.team.upsert({
      where: { category_year: { category: spec.category, year: spec.year } },
      create: {
        ...spec,
        galleryImages: [spec.backgroundImage, spec.cardBackgroundImage],
        monitorId: monitor?.id,
      },
      update: {},
    });
    allTeams.push(team);
  }

  for (const team of allTeams) {
    for (const profile of [...sharedProfiles, ...tin2326Profiles].slice(0, 3)) {
      await prisma.teamMember.upsert({
        where: { teamId_studentProfileId: { studentProfileId: profile.id, teamId: team.id } },
        create: { role: "Thành viên", studentProfileId: profile.id, teamId: team.id },
        update: {},
      });
    }

    const teamKey = team.category.toLowerCase().replace("_", "-");
    const stories = [
      {
        coverImage: images.coding,
        excerpt: "Những buổi đầu tiên cùng làm quen bài toán và xây nhịp học chung.",
        slug: `${teamKey}-${team.year}-buoi-dau`,
        title: "Buổi tập đầu tiên",
        content: "Buổi tập đầu tiên luôn có chút hồi hộp. Cả đội ghi lại điều chưa hiểu, chia nhóm trao đổi và kết thúc buổi học với một mục tiêu rõ ràng hơn.",
        media: [{ title: "Không gian luyện tập", type: MediaType.IMAGE, url: images.coding }],
      },
      {
        coverImage: images.collaboration,
        excerpt: "Một vòng review nơi mọi lời giải đều được lắng nghe và cải thiện.",
        slug: `${teamKey}-${team.year}-review`,
        title: "Ngày review sản phẩm",
        content: "Từng thành viên trình bày cách nghĩ của mình. Có giải pháp được giữ lại, có ý tưởng được làm lại, nhưng mỗi người đều tiến thêm một bước.",
        media: [
          { title: "Làm việc nhóm", type: MediaType.IMAGE, url: images.collaboration },
          { title: "Video hoạt động", type: MediaType.VIDEO, url: sampleVideo },
        ],
      },
      {
        coverImage: images.study,
        excerpt: "Những dòng lưu bút ngắn sau một mùa cùng học và cùng thử sức.",
        slug: `${teamKey}-${team.year}-luu-but`,
        title: "Điều muốn nhớ mãi",
        content: "Điều đáng nhớ không chỉ là kết quả, mà còn là những buổi ngồi cạnh nhau, kiên nhẫn sửa từng lỗi nhỏ và cổ vũ nhau trước ngày thử sức.",
        media: [
          { title: "Khoảnh khắc đội", type: MediaType.IMAGE, url: images.study },
          { title: "Nhạc nền", type: MediaType.AUDIO, url: sampleAudio },
        ],
      },
    ];

    for (const story of stories) {
      const { media, ...post } = story;
      await memoryPost(
        {
          ...post,
          teamId: team.id,
          type: MemoryPostType.TEAM_STORY,
        },
        media,
      );
    }
  }

  console.log("Đã bổ sung nội dung trình diễn an toàn cho lớp học và đội tuyển.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
