import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';
import { locales, defaultLocale } from '@/config/locale';
import { getPosts, PostStatus, PostType } from '@/shared/models/post';
import { getPanShares, PanShareStatus } from '@/shared/models/pan_share';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = envConfigs.app_url;

  // static pages that should be indexed
  const staticPaths = [
    '/',
    '/pricing',
    '/blog',
    '/showcases',
    '/submit',
  ];

  // build alternates for each locale
  function buildAlternates(path: string) {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      const prefix = locale === defaultLocale ? '' : `/${locale}`;
      languages[locale] = `${appUrl}${prefix}${path}`;
    }
    languages['x-default'] = `${appUrl}${path}`;
    return { languages };
  }

  // static pages
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${appUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1.0 : 0.8,
    alternates: buildAlternates(path),
  }));

  // blog posts
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPosts({
      type: PostType.ARTICLE,
      status: PostStatus.PUBLISHED,
      limit: 1000,
    });
    blogEntries = posts.map((p) => ({
      url: `${appUrl}/blog/${p.slug}`,
      lastModified: p.updatedAt || p.createdAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: buildAlternates(`/blog/${p.slug}`),
    }));
  } catch {
    // db may not be available during build
  }

  // pan share pages
  let shareEntries: MetadataRoute.Sitemap = [];
  try {
    const shares = await getPanShares({
      status: PanShareStatus.PUBLISHED,
      limit: 1000,
    });
    shareEntries = shares.map((s) => ({
      url: `${appUrl}/share/${s.id}`,
      lastModified: s.updatedAt || s.createdAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: buildAlternates(`/share/${s.id}`),
    }));
  } catch {
    // db may not be available during build
  }

  return [...staticEntries, ...blogEntries, ...shareEntries];
}
