<script setup>
defineProps({
  status: { type: String, required: true }
})
</script>

<template>
  <span class="badge" :class="'badge-' + status">
    <slot>{{ status }}</slot>
  </span>
</template>
