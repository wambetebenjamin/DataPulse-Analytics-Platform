import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowRight, CalendarDays, ChevronRight, Clock } from "lucide-react";
import { formatPostDate, getPost, getPostSlugs, getRelatedPosts } from "@/lib/blog";
import { SITE } from "@/data/site";
import page from "@/components/marketing/page-header.module.css";
import sections from "@/components/marketing/sections.module.css";
import styles from "@/components/marketing/blog.module.css";

interface Params {
  params: { slug: string };
}

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const post = getPost(params.slug);
  if (!post) return { title: "Article not found" };

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.iso,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function BlogPostPage({ params }: Params) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const related = getRelatedPosts(post, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.iso,
    dateModified: post.iso,
    author: {
      "@type": "Person",
      name: post.author,
      jobTitle: post.authorRole,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.legalName,
      url: SITE.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE.url}/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
    articleSection: post.category,
    wordCount: post.content.trim().split(/\s+/).length,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className={page.header}>
        <div className="dp-container">
          <nav className={page.breadcrumb} aria-label="Breadcrumb">
            <Link href="/blog">Blog</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span>{post.category}</span>
          </nav>
          <h1 className={`${page.title} ${page.titleWide}`}>{post.title}</h1>
          <p className={page.lede}>{post.description}</p>
          <div className={page.meta}>
            <span>
              <CalendarDays size={12} aria-hidden="true" />{" "}
              <time dateTime={post.iso}>{formatPostDate(post.iso)}</time>
            </span>
            <span>
              <Clock size={12} aria-hidden="true" /> {post.readingTime} min read
            </span>
            <span>{post.author}</span>
          </div>
        </div>
      </header>

      <section className={sections.section}>
        <div className="dp-container">
          <div className={styles.articleLayout}>
            <article className={styles.prose}>
              <MDXRemote source={post.content} />
            </article>

            <aside className={styles.aside}>
              <div className={styles.asideCard}>
                <p className={styles.asideLabel}>Written by</p>
                <div className={styles.authorRow}>
                  <span className={styles.authorAvatar} aria-hidden="true">
                    {initialsOf(post.author)}
                  </span>
                  <div>
                    <p className={styles.authorName}>{post.author}</p>
                    <p className={styles.authorRole}>{post.authorRole}</p>
                  </div>
                </div>
              </div>

              {post.tags.length > 0 ? (
                <div className={styles.asideCard}>
                  <p className={styles.asideLabel}>Topics</p>
                  <div className={styles.tagRow}>
                    {post.tags.map((tag) => (
                      <span className={styles.tag} key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className={`${styles.asideCard} ${styles.asideCardDark}`}>
                <p className={styles.asideLabel}>Try it yourself</p>
                <p className={styles.asideCopy}>
                  Every calculation in this article is already built into the DataPulse dashboard.
                  Open the public demo and look at it running on sample data.
                </p>
                <Link href="/demo" className={styles.asideCta}>
                  Open live demo
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>

          {related.length > 0 ? (
            <div className={styles.related}>
              <h2 className={styles.relatedTitle}>Keep reading</h2>
              <div className={styles.grid}>
                {related.map((item) => (
                  <Link href={`/blog/${item.slug}`} key={item.slug} className={styles.card}>
                    <span className={styles.category}>{item.category}</span>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.cardExcerpt}>{item.description}</p>
                    <div className={styles.cardMeta}>
                      <span>
                        <CalendarDays size={13} aria-hidden="true" />
                        <time dateTime={item.iso}>{formatPostDate(item.iso)}</time>
                      </span>
                      <span>
                        <Clock size={13} aria-hidden="true" />
                        {item.readingTime} min
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}

/** Posts are files on disk, so the full set is known at build time. */
export const dynamicParams = false;
