import { envConfigs } from '@/config';

export function ArticleJsonLd({
  title,
  description,
  slug,
  image,
  authorName,
  publishedAt,
}: {
  title: string;
  description?: string;
  slug: string;
  image?: string;
  authorName?: string;
  publishedAt?: string;
}) {
  const appUrl = envConfigs.app_url;

  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : `${appUrl}${image}`
    : `${appUrl}${envConfigs.app_preview_image}`;

  const now = new Date().toISOString();

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description || '',
    image: imageUrl,
    url: `${appUrl}/blog/${slug}`,
    datePublished: publishedAt || now,
    dateModified: publishedAt || now,
    author: {
      '@type': 'Person',
      name: authorName || envConfigs.app_name,
    },
    publisher: {
      '@type': 'Organization',
      name: envConfigs.app_name,
      logo: {
        '@type': 'ImageObject',
        url: `${appUrl}${envConfigs.app_logo}`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
