<script setup lang="ts">
import type { TeamMember } from '~/data/team';

// 首页「开发人员」的一张成员卡片。
// 宽度固定 + shrink-0：卡片会被放进 UMarquee 或横向滚动容器，
// 任何一侧允许收缩都会让头像被压扁。
defineProps<{ member: TeamMember & { avatar: string } }>();
</script>

<template>
  <UPageCard
    variant="outline"
    class="w-[220px] shrink-0 snap-start"
    :ui="{ container: 'flex flex-col items-center gap-3 p-5 text-center lg:flex' }"
  >
    <UAvatar
      size="3xl"
      :src="member.avatar"
      :alt="member.name"
      :ui="{ root: 'size-20 text-2xl sm:size-24' }"
    />
    <h3 class="mt-1 text-base font-semibold text-default">{{ member.name }}</h3>
    <p class="text-[13px] leading-[1.6] text-toned">{{ member.role }}</p>
  </UPageCard>
</template>
