import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock, User } from "lucide-react";
import NewsletterForm from "@/components/forms/NewsletterForm";
import { getAllPosts, formatPostDate } from "@/lib/blog";
import { SITE } from "@/data/site";
import page from "@/components/marketing/page-header.module.css";
import sections from "@/components/marketing/sections.module.css";
import styles from "@/components/marketing/blog.module.css";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Practical business intelligence writing for East African organisations: KPIs, M-Pesa data, forecasting, inventory analytics, dashboard design and Kenyan data protection.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — DataPulse Analytics",
    description:
      "Monthly data insights for East African businesses. Forecasting, M-Pesa analytics, inventory and compliance, written by the DataPulse team.",
    url: "/blog",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const featured = posts.filter((p) => p.featured).slice(0, 2);
  const rest = posts.filter((p) => !featured.some((f) => f.slug === p.slug));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE.name} Blog`,
    url: `${SITE.url}/blog`,
    description:
      "Practical business intelligence writing for East African organisations.",
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.iso,
      author: { "@type": "Person", name: p.author },
      url: `${SITE.url}/blog/${p.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className={page.header}>
        <div className="dp-container">
          <p className="dp-eyebrow">Blog</p>
          <h1 className={`${page.title} ${page.titleWide}`}>
            Monthly data insights for East African businesses
          </h1>
          <p className={page.lede}>
            No growth-hacking listicles. Working notes from building analytics for Kenyan
            retailers, hotels, clinics, schools and NGOs — written by the people who build it.
          </p>
          <div className={page.meta}>
            <span>{posts.length} articles</span>
            <span>Written in Nairobi</span>
          </div>
        </div>
      </header>

      <section className={sections.section}>
        <div className="dp-container">
          {featured.length > 0 ? (
            <div className={styles.featured}>
              {featured.map((post) => (
                <Link
                  href={`/blog/${post.slug}`}
                  key={post.slug}
                  className={`${styles.card} ${styles.cardFeatured}`}
                >
                  <span className={styles.category}>{post.category}</span>
                  <h2 className={styles.cardTitle}>{post.title}</h2>
                  <p className={styles.cardExcerpt}>{post.description}</p>
                  <div className={styles.cardMeta}>
                    <span>
                      <User size={13} aria-hidden="true" />
                      {post.author}
                    </span>
                    <span>
                      <CalendarDays size={13} aria-hidden="true" />
                      <time dateTime={post.iso}>{formatPostDate(post.iso)}</time>
                    </span>
                    <span>
                      <Clock size={13} aria-hidden="true" />
                      {post.readingTime} min read
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          <div className={styles.grid}>
            {rest.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.slug} className={styles.card}>
                <span className={styles.category}>{post.category}</span>
                <h2 className={styles.cardTitle}>{post.title}</h2>
                <p className={styles.cardExcerpt}>{post.description}</p>
                <div className={styles.cardMeta}>
                  <span>
                    <CalendarDays size={13} aria-hidden="true" />
                    <time dateTime={post.iso}>{formatPostDate(post.iso)}</time>
                  </span>
                  <span>
                    <Clock size={13} aria-hidden="true" />
                    {post.readingTime} min
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={sections.section}>
        <div className="dp-container">
          <div className={sections.newsBand}>
            <div>
              <h2 className={sections.newsTitle}>Monthly data insights for East African businesses</h2>
              <p className={sections.newsCopy}>
                One email a month. New articles, product notes and the occasional template you can
                use the same afternoon. Unsubscribe in one click.
              </p>
            </div>
            <NewsletterForm variant="section" />
          </div>
        </div>
      </section>
    </>
  );
}
