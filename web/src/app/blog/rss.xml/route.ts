import { getPosts, getSiteContent, SITE_URL } from '@/lib/api';
import { getI18n, LOCALE_META } from '@/i18n';
import { parseTags } from '@/lib/projects';

/** Escapa texto para XML. */
const xml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/**
 * GET /blog/rss.xml (y /en/blog/rss.xml) — feed RSS 2.0 con los artículos
 * publicados en el idioma de la ruta.
 */
export async function GET() {
  const { t, locale, href } = await getI18n();
  const [posts, content] = await Promise.all([getPosts(locale), getSiteContent(locale)]);
  const siteName = content.settings.siteName || 'Nathan Quevedo';
  const blogUrl = `${SITE_URL}${href('/blog')}`;

  const items = posts
    .map((p) => {
      const url = `${SITE_URL}${href(`/blog/${p.slug}`)}`;
      return [
        '    <item>',
        `      <title>${xml(p.title)}</title>`,
        `      <link>${xml(url)}</link>`,
        `      <guid isPermaLink="true">${xml(url)}</guid>`,
        p.publishedAt ? `      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>` : '',
        p.excerpt ? `      <description>${xml(p.excerpt)}</description>` : '',
        ...parseTags(p.tags).map((tag) => `      <category>${xml(tag)}</category>`),
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(`${t.pages.blog.eyebrow} · ${siteName}`)}</title>
    <link>${xml(blogUrl)}</link>
    <description>${xml(t.pages.blog.metaDescription)}</description>
    <language>${LOCALE_META[locale].intl}</language>
    <atom:link href="${xml(`${SITE_URL}${href('/blog/rss.xml')}`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=600' },
  });
}
