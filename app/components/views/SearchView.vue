<script setup lang="ts">
import SearchResults from '../SearchResults.vue';
import NewsSearchBox from '../NewsSearchBox.vue';
import PageTitle from '../PageTitle.vue';
</script>

<template>
  <div class="mx-auto max-w-page">
    <!-- 搜索框置于标题之上（搜索页独有布局） -->
    <NewsSearchBox autofocus />

    <UPageHeader :as="{ title: 'div' }">
      <template #title>
        <PageTitle title="搜索" />
      </template>
    </UPageHeader>

    <SearchResults />
  </div>
</template>
