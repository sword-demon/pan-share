import { envConfigs } from '@/config';

export function WebSiteJsonLd() {
  const appUrl = envConfigs.app_url;
  const appName = envConfigs.app_name;

  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${appUrl}/#website`,
        url: appUrl,
        name: appName,
        inLanguage: ['en', 'zh'],
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${appUrl}/showcases?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${appUrl}/#organization`,
        name: appName,
        url: appUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${appUrl}${envConfigs.app_logo}`,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
