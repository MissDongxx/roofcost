import { setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { postsSource } from '@/core/docs/source';
import type { Page } from 'fumadocs-core/source';
import { getTranslations } from 'next-intl/server';

interface BlogPost {
  title: string;
  description: string;
  slug: string;
  image?: string;
  created_at: string;
  url: string;
}

async function getBlogPosts(locale: string): Promise<BlogPost[]> {
  setRequestLocale(locale);

  const pages = postsSource.getPages(locale);

  const posts: BlogPost[] = pages
    .map((page: Page<any>) => {
      const frontmatter = page.data;
      return {
        title: frontmatter.title || page.data.title || '',
        description: frontmatter.description || page.data.description || '',
        slug: page.url.replace('/blog/', '').replace(`${locale}/blog/`, ''),
        image: frontmatter.image,
        created_at: String(frontmatter.publishedAt || frontmatter.created_at || ''),
        url: page.url,
      };
    })
    .filter((post) => post.title && post.description)
    .slice(0, 3);

  return posts;
}

export async function BlogSection({ locale = 'en' }: { locale?: string }) {
  const posts = await getBlogPosts(locale);
  const t = await getTranslations('homepage.blog');

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="bg-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-[60px] md:py-[100px]">
        <div className="font-mono text-[11px] text-[var(--rust)] uppercase tracking-[0.12em] mb-3 flex items-center gap-2.5">
          Latest insights
          <span className="flex-1 max-w-[48px] h-px bg-[var(--rust)]"></span>
        </div>
        <h2 className="font-serif text-[clamp(28px,4vw,42px)] text-[var(--ink)] tracking-tight mb-3">
          Expert roofing<br />
          cost guides.
        </h2>
        <p className="text-[16px] text-[var(--ink-3)] max-w-[520px] leading-[1.7] mb-12">
          Learn how to estimate, compare, and save on your roof replacement with data-backed insights.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {posts.map((post, idx) => (
            <Link
              key={idx}
              href={post.url}
              className="group block bg-white rounded-lg border border-[var(--cream-3)] overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
            >
              {post.image && (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--cream-2)]">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    unoptimized={post.image.startsWith('http')}
                  />
                </div>
              )}
              <div className="p-6">
                {post.created_at && (
                  <div className="flex items-center gap-1.5 text-[var(--ink-3)] text-[11px] font-mono uppercase tracking-[0.08em] mb-3">
                    <Calendar className="w-3 h-3" />
                    {post.created_at}
                  </div>
                )}
                <h3 className="font-serif text-[18px] text-[var(--slate)] font-semibold leading-tight mb-2 group-hover:text-[var(--rust)] transition-colors">
                  {post.title}
                </h3>
                <p className="text-[14px] text-[var(--ink-3)] leading-[1.6] line-clamp-3">
                  {post.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-[var(--rust)] text-white font-medium px-6 py-3 rounded-lg transition-all hover:bg-[var(--rust-2)] hover:shadow-md"
          >
            View all guides
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
