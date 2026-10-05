<script setup lang="ts">
import { withBase } from 'vitepress';
</script>

<template>
  <div class="not-found">
    <p class="code">404</p>
    <h1>页面走丢了</h1>
    <p class="desc">你访问的页面不存在，或者已经被移动。</p>
    <a class="btn" :href="withBase('/')">返回首页</a>
  </div>
</template>

<style lang="scss" scoped>
@use '../../styles/variables' as *;

.not-found {
  max-width: 520px;
  margin: 10vh auto 0;
  padding: 40px 32px;
  text-align: center;
  background: $card;
  border: 1px solid $line;
  border-radius: $radius-l;

  .code {
    font-size: 64px;
    font-weight: 800;
    line-height: 1;
    color: $brand-deep;
  }

  h1 {
    margin: 12px 0 8px;
    font-size: 22px;
    color: $ink;
  }

  .desc {
    margin-bottom: 24px;
    font-size: 15px;
    color: $ink-2;
  }

  .btn {
    display: inline-block;
    padding: 11px 28px;
    font-weight: 600;
    color: #fff;
    background: $brand-grad;
    border-radius: $radius-full;
  }
}
</style>