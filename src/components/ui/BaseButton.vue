<script setup>
defineProps({
  variant: { type: String, default: 'primary', validator: (v) => ['primary', 'secondary', 'danger', 'ghost'].includes(v) },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  iconOnly: { type: Boolean, default: false }
})
</script>

<template>
  <button 
    class="btn" 
    :class="[`btn-${variant}`, size === 'sm' ? 'btn-sm' : '', iconOnly ? 'btn-icon' : '']"
    v-bind="$attrs"
  >
    <slot name="icon"></slot>
    <slot v-if="!iconOnly"></slot>
  </button>
</template>
