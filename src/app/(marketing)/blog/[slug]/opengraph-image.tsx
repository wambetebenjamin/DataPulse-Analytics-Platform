import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og";
import { formatPostDate, getPost, getPostSlugs } from "@/lib/blog";

export const runtime = "nodejs";
export const alt = "DataPulse Analytics article";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export default function OgImage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);

  if (!post) {
    return renderOgCard({
      eyebrow: "Blog",
      title: "Monthly data insights for East African businesses",
    });
  }

  return renderOgCard({
    eyebrow: post.category,
    title: post.title,
    description: post.description,
    tags: post.tags.slice(0, 3),
    footer: `${post.author} · ${formatPostDate(post.iso)} · ${post.readingTime} min read`,
  });
}
