import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

import { getThemePage } from '@/core/theme';
import { getMetadata } from '@/shared/lib/seo';
import { getPostsAndCategories } from '@/shared/models/post';
import {
  Category as CategoryType,
  Post as PostType,
} from '@/shared/types/blocks/blog';
import { DynamicPage } from '@/shared/types/blocks/landing';
import { postsSource } from '@/core/docs/source';
import type { Page } from 'fumadocs-core/source';
import { Clock, Tag } from 'lucide-react';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'pages.blog.metadata',
  canonicalUrl: '/blog',
});

interface ArticleWithPriority extends PostType {
  priority?: string;
  keywords?: string[];
  relatedCities?: string[];
  relatedMaterials?: string[];
}

function getPriorityOrder(priority?: string): number {
  const priorityMap: Record<string, number> = {
    'P0': 0,
    'P1': 1,
    'P2': 2,
    'P3': 3,
  };
  return priorityMap[priority || 'P3'] ?? 4;
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: number; pageSize?: number }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // load blog data
  const t = await getTranslations('pages.blog');

  let posts: ArticleWithPriority[] = [];
  let categories: CategoryType[] = [];

  // Get all posts from postsSource to access frontmatter
  const pages = postsSource.getPages(locale);

  // Map pages to articles with priority
  const articlesWithPriority: ArticleWithPriority[] = pages.map((page: Page<any>) => {
    const frontmatter = page.data;
    return {
      id: page.path,
      slug: page.url.replace('/blog/', '').replace(`${locale}/blog/`, ''),
      title: frontmatter.title || page.data.title || '',
      description: frontmatter.description || page.data.description || '',
      created_at: String(frontmatter.publishedAt || frontmatter.created_at || ''),
      image: frontmatter.image,
      url: page.url,
      priority: frontmatter.priority,
      keywords: frontmatter.keywords,
      relatedCities: frontmatter.relatedCities,
      relatedMaterials: frontmatter.relatedMaterials,
    } as ArticleWithPriority;
  });

  // Sort by priority first, then by date
  articlesWithPriority.sort((a, b) => {
    const priorityOrder = getPriorityOrder(a.priority) - getPriorityOrder(b.priority);
    if (priorityOrder !== 0) return priorityOrder;

    // Within same priority, sort by date (newest first)
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  posts = articlesWithPriority;

  // current category data
  const currentCategory: CategoryType = {
    id: 'all',
    slug: 'all',
    title: t('messages.all'),
    url: `/blog`,
  };

  try {
    const { categories: allCategories } = await getPostsAndCategories({
      locale,
      page: 1,
      limit: 30,
    });

    categories = allCategories;
    categories.unshift(currentCategory);
  } catch (error) {
    console.log('getting posts failed:', error);
  }

  // Group by priority
  const groupedPosts = {
    P0: posts.filter((p) => p.priority === 'P0'),
    P1: posts.filter((p) => p.priority === 'P1'),
    P2: posts.filter((p) => p.priority === 'P2'),
    P3: posts.filter((p) => p.priority === 'P3' || !p.priority),
  };

  // build page sections
  const page: DynamicPage = {
    title: t('page.title'),
    sections: {
      blog: {
        ...t.raw('page.sections.blog'),
        data: {
          categories,
          currentCategory,
          posts,
          groupedPosts,
        },
      },
    },
  };

  // load page component
  const Page = await getThemePage('dynamic-page');

  return <Page locale={locale} page={page} />;
}
