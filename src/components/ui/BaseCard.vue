<script setup>
defineProps({
  title: { type: String, default: '' },
  noPadding: { type: Boolean, default: false }
})
</script>

<template>
  <div class="card">
    <div v-if="title || $slots.header" class="card-header">
      <span class="card-title"><slot name="header">{{ title }}</slot></span>
      <slot name="header-actions"></slot>
    </div>
    <div :class="['card-body', { 'p-0': noPadding }]">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.p-0 { padding: 0 !important; }
</style>
