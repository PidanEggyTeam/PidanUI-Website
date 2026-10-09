<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useData } from 'vitepress';
import { setupScrollReveal } from './composables/useScrollReveal';
import SiteSidebar from './components/SiteSidebar.vue';
import SiteRightBar from './components/SiteRightBar.vue';
import SearchDialog from './components/SearchDialog.vue';
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

/** 切页时复位主滚动容器；带锚点的跳转交给页内锚点逻辑处理。 */
function beforePageEnter(): void {
  if (typeof document === 'undefined') return;
  const scroller = document.querySelector<HTMLElement>('.site-main');
  if (scroller && !window.location.hash) scroller.scrollTop = 0;
}

/** 等新页面完成进入后再扫描，避免 out-in 过渡空档中收集到旧页面节点。 */
function afterPageEnter(): void {
  setupScrollReveal();
}

onMounted(() => {
  beforePageEnter();
  afterPageEnter();
});
</script>

<template>
  <SiteSidebar />

  <!-- 主内容地标：浏览器阅读模式据此定位正文，忽略侧栏等噪声 -->
  <main id="content" class="site-main" role="main" :data-layout="layout">
    <!-- 每个视图都带「路由身份」key：切换时由 Transition 先离场、再进入；
         分页、换文章等「同布局不同内容」的情况也各有唯一 key。 -->
    <Transition
      name="page"
      mode="out-in"
      appear
      @before-enter="beforePageEnter"
      @after-enter="afterPageEnter"
    >
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
    </Transition>
  </main>

  <SiteRightBar />
  <SearchDialog />
</template>