<script setup>
import { RiCloseLine } from 'vue-remix-icons'
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Modal' }
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="modal-overlay" :class="{ open: modelValue }" @click="$emit('update:modelValue', false)">
    <div class="modal" @click.stop v-if="modelValue">
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <button class="modal-close" @click="$emit('update:modelValue', false)">
          <RiCloseLine size="18" />
        </button>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div class="modal-footer" v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>
