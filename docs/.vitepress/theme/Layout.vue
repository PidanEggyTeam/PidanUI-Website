<script setup lang="ts">
import { computed, nextTick, onMounted, watch } from 'vue';
import { useData } from 'vitepress';
import { setupScrollReveal } from './composables/useScrollReveal';
import SiteSidebar from './components/SiteSidebar.vue';
import SiteRightBar from './components/SiteRightBar.vue';
import HomeView from './components/views/HomeView.vue';
import DownloadView from './components/views/DownloadView.vue';
import NewsHomeView from './components/views/NewsHomeView.vue';
import PostView from './components/views/PostView.vue';
import ArchiveView from './components/views/ArchiveView.vue';
import CategoryIndexView from './components/views/CategoryIndexView.vue';
import CategoryView from './components/views/CategoryView.vue';
import TagIndexView from './components/views/TagIndexView.vue';
import TagView from './components/views/TagView.vue';
import SearchView from './components/views/SearchView.vue';
import AboutView from './components/views/AboutView.vue';
import PersonalityTestView from './components/views/PersonalityTestView.vue';
import NotFoundView from './components/views/NotFoundView.vue';

// 与 VitePress 自定义主题约定一致：按 frontmatter.layout 切换页面外壳
const { page, frontmatter, params } = useData();

const layout = computed(() => (frontmatter.value.layout as string) || 'post');
// 静态页面没有动态路由参数，params 可能为 undefined
const currentPage = computed(() => Number(params.value?.page) || 1);

function decodeParam(value: unknown): string {
  const raw = typeof value === 'string' ? value : '';
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

const categoryName = computed(() => decodeParam(params.value?.category));
const tagName = computed(() => decodeParam(params.value?.tag));

/**
 * 路由切换后的收尾（每次换页执行一次）：
 *   1. 把主滚动容器复位到顶部 —— VitePress 用 window.scrollTo(0, 0) 复位，但本站的
 *      滚动容器是 .site-main，实测换页后会停留在上一页的滚动位置。
 *      带锚点的跳转不复位，交给页内锚点逻辑（usePostEnhance）处理。
 *   2. 重新挂载滚动淡入：观察对象随新页面 DOM 重建，不重建会一直观察已卸载的节点。
 * 视图都带「路由身份」key，因此 nextTick 后拿到的已是新页面 DOM。
 */
async function afterRouteChange(): Promise<void> {
  if (typeof document === 'undefined') return;
  await nextTick();
  const scroller = document.querySelector<HTMLElement>('.site-main');
  if (scroller && !window.location.hash) scroller.scrollTop = 0;
  setupScrollReveal();
}

onMounted(() => void afterRouteChange());
watch(
  () => page.value.relativePath,
  () => void afterRouteChange(),
);
</script>

<template>
  <SiteSidebar />

  <!-- 主内容地标：浏览器阅读模式据此定位正文，忽略侧栏等噪声 -->
  <main id="content" class="site-main" role="main" :data-layout="layout">
    <!-- 每个视图都带「路由身份」key：换页即重挂载，从而触发 _animation.scss 的进入动画，
         并让 afterRouteChange 在 nextTick 后拿到的是新页面 DOM。
         分页、换文章等「同布局不同内容」的情况也各有唯一 key。 -->
    <NotFoundView v-if="page.isNotFound" key="not-found" />
    <HomeView v-else-if="layout === 'home'" key="home" />
    <DownloadView v-else-if="layout === 'download'" key="download" />
    <NewsHomeView
      v-else-if="layout === 'news-home'"
      :key="`news-${currentPage}`"
      :page="currentPage"
    />
    <ArchiveView v-else-if="layout === 'archive'" :key="`archive-${currentPage}`" :page="currentPage" />
    <CategoryIndexView v-else-if="layout === 'category-index'" key="category-index" />
    <CategoryView
      v-else-if="layout === 'category'"
      :key="`category-${categoryName}-${currentPage}`"
      :name="categoryName"
      :page="currentPage"
    />
    <TagIndexView v-else-if="layout === 'tag-index'" key="tag-index" />
    <TagView
      v-else-if="layout === 'tag'"
      :key="`tag-${tagName}-${currentPage}`"
      :name="tagName"
      :page="currentPage"
    />
    <SearchView v-else-if="layout === 'search'" key="search" />
    <AboutView v-else-if="layout === 'about'" key="about" />
    <PersonalityTestView v-else-if="layout === 'test'" key="test" />
    <PostView v-else :key="`post-${page.relativePath}`" />
  </main>

  <SiteRightBar />
</template>