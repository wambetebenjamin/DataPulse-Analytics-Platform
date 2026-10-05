import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

/**
 * MDX blog loader. Posts live in /content/blog as `<slug>.mdx` with YAML
 * frontmatter; nothing is written at runtime, so every read is cheap and the
 * index/post routes can be statically generated.
 */

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  /** ISO date, derived — used for sorting and <time dateTime>. */
  iso: string;
  author: string;
  authorRole: string;
  category: string;
  tags: string[];
  readingTime: number;
  featured: boolean;
  image?: string;
  imageAlt?: string;
}

export interface Post extends PostMeta {
  content: string;
}

const CONTENT_DIR = join(process.cwd(), "content", "blog");

const WORDS_PER_MINUTE = 215;

function readingTimeOf(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function parse(slug: string): Post {
  const raw = readFileSync(join(CONTENT_DIR, `${slug}.mdx`), "utf8");
  const { data, content } = matter(raw);
  const date = String(data.date ?? "");

  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date,
    iso: new Date(date).toISOString(),
    author: String(data.author ?? "DataPulse Analytics"),
    authorRole: String(data.authorRole ?? "DataPulse Analytics"),
    category: String(data.category ?? "Insights"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingTime: readingTimeOf(content),
    featured: Boolean(data.featured),
    image: data.image ? String(data.image) : undefined,
    imageAlt: data.imageAlt ? String(data.imageAlt) : undefined,
    content,
  };
}

export function getPostSlugs(): string[] {
  if (!existsSync(CONTENT_DIR)) return [];
  return readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/** All posts, newest first. */
export function getAllPosts(): Post[] {
  return getPostSlugs()
    .map(parse)
    .sort((a, b) => (a.iso < b.iso ? 1 : -1));
}

export function getPost(slug: string): Post | null {
  if (!existsSync(join(CONTENT_DIR, `${slug}.mdx`))) return null;
  return parse(slug);
}

export function getCategories(posts: Post[]): string[] {
  return Array.from(new Set(posts.map((p) => p.category))).sort();
}

/** Same category first, then most recent — used for "Keep reading". */
export function getRelatedPosts(post: Post, limit = 3): Post[] {
  return getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => {
      const aScore = a.category === post.category ? 1 : 0;
      const bScore = b.category === post.category ? 1 : 0;
      if (aScore !== bScore) return bScore - aScore;
      return a.iso < b.iso ? 1 : -1;
    })
    .slice(0, limit);
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
