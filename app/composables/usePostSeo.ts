import type { MaybeRefOrGetter } from 'vue';
import { SITE } from '#shared/site';
import { parsePostDate } from '#shared/utils/date';
import { absoluteAsset, absoluteUrl } from '#shared/utils/post';
import { toArray } from '#shared/utils/term';
import { withSiteSuffix } from '#shared/utils/title';

/**
 * 文章页 SEO：标题 / 描述 / OG / article:* / JSON-LD(NewsArticle)。
 *
 * 与 VitePress 时期 transformHead 的差异（有意修正）：
 * 旧实现用 relativePath.startsWith('posts/') 判定文章页，导致 /posts/ 列表页
 * 也被标成 og:type=article；这里只在实际的文章页调用，列表页走 usePageSeo。
 */
export function usePostSeo(doc: MaybeRefOrGetter<Record<string, any> | null | undefined>): void {
  const d = computed(() => toValue(doc));
  const url = computed(() => absoluteUrl(d.value?.path ?? '/'));
  const title = computed(() => String(d.value?.title ?? SITE.brand));
  const description = computed(() => String(d.value?.description ?? ''));
  const cover = computed(() => absoluteAsset(d.value?.cover || '/images/default_cover.webp'));
  const published = computed(() => {
    const date = parsePostDate(d.value?.date);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  });
  // <title> 的 `· PidanUI` 后缀由 app.vue 的全局 titleTemplate 追加；
  // og / twitter 标签不经过模板，这里显式补，保持与 <title> 一致
  const pageTitle = computed(() => withSiteSuffix(title.value));

  useSeoMeta({
    title,
    description,
    ogType: 'article',
    ogSiteName: SITE.brand,
    ogTitle: pageTitle,
    ogDescription: description,
    ogUrl: url,
    ogImage: cover,
    twitterCard: 'summary_large_image',
    twitterTitle: pageTitle,
    articlePublishedTime: published,
    articleAuthor: [SITE.author],
    articleTag: () => toArray(d.value?.tags),
  });

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: computed(() =>
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: title.value,
            description: description.value,
            mainEntityOfPage: url.value,
            inLanguage: 'zh-CN',
            author: { '@type': 'Organization', name: SITE.author, url: SITE.mainUrl },
            publisher: {
              '@type': 'Organization',
              name: SITE.brand,
              url: SITE.mainUrl,
              logo: { '@type': 'ImageObject', url: absoluteAsset('/images/logo.webp') },
            },
            ...(published.value
              ? { datePublished: published.value, dateModified: published.value }
              : {}),
            image: [cover.value],
          }),
        ),
      },
    ],
  });
}
