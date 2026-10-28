<template>
  <!-- 与 PostCard 同尺寸的骨架（min-h-104 / 封面 148px），避免结果区高度跳变。
       USkeleton 主题默认 bg-elevated，而 --ui-bg-elevated 被映射成卡片白，
       白底上是隐形骨架 —— 这里统一改成 bg-line。 -->
  <div
    class="flex min-h-[104px] gap-3 rounded-(--radius-l) border border-default bg-default p-2"
    aria-hidden="true"
  >
    <USkeleton class="w-[148px] shrink-0 rounded-(--radius-m)" :ui="{ base: 'bg-line' }" />
    <div class="flex flex-1 flex-col justify-center gap-2 py-1 pr-1">
      <USkeleton class="h-3.5 w-4/5" :ui="{ base: 'bg-line' }" />
      <USkeleton class="h-3 w-1/3" :ui="{ base: 'bg-line' }" />
    </div>
  </div>
</template>
