import { MediaStrip } from "@/components/content/media-strip";
import { RichContent } from "@/components/content/rich-content";
import { ShareReactionBar } from "@/components/content/share-reaction-bar";
import { displayImageUrl } from "@/lib/media-urls";
import { prisma } from "@/lib/prisma";

const demoHeroImage =
  "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1800&q=80";

const demoMarkdown = `
## Bài viết mẫu

Nội dung blog sẽ được lưu trong trường \`content\` của model \`Post\` và render bằng Markdown.

- Hỗ trợ danh sách
- Hỗ trợ liên kết
- Có thể mở rộng sang editor rich text sau
`;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } }).catch(() => null);
  const heroImage = post?.backgroundImage ?? post?.coverImage ?? demoHeroImage;

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="relative overflow-hidden bg-slate-950 px-5 py-20 text-white sm:px-8 lg:px-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${displayImageUrl(heroImage) ?? heroImage})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/82 via-slate-950/46 to-transparent" />
        <div className="relative mx-auto max-w-3xl">
          <p className="text-sm font-medium uppercase text-emerald-100">
            /blog/{post?.slug ?? slug}
          </p>
          <h1 className="mt-2 text-4xl font-semibold">{post?.title ?? "Bài viết mrtee.vn"}</h1>
        </div>
      </section>
      <article className="mx-auto max-w-3xl px-5 py-10 sm:px-8 lg:px-10">
        <RichContent content={post?.content ?? demoMarkdown} format={post?.contentFormat} />
        {!post ? (
          <MediaStrip
            items={[
              {
                type: "LINK",
                url: "https://mrtee.vn",
                title: "Liên kết tham khảo",
              },
            ]}
          />
        ) : null}
        <ShareReactionBar
          className="mt-8"
          id={`blog:${post?.slug ?? slug}`}
          title={post?.title ?? "Bài viết mrtee.vn"}
        />
      </article>
    </main>
  );
}
