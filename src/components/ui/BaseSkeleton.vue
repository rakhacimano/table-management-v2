<script setup>
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '20px' },
  borderRadius: { type: String, default: 'var(--radius-sm)' },
  variant: { type: String, default: 'rect' } // rect, circle, text
})
</script>

<template>
  <div 
    class="skeleton" 
    :class="variant"
    :style="{ 
      width: width, 
      height: height, 
      borderRadius: variant === 'circle' ? '50%' : borderRadius 
    }"
  ></div>
</template>

<style scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 25%,
    var(--bg-secondary) 50%,
    var(--bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite ease-in-out;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.circle {
  aspect-ratio: 1 / 1;
}
</style>
