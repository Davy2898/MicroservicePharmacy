<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div
        v-if="open"
        class="confirm-backdrop"
        role="presentation"
        @click.self="handleCancel"
        @keydown.esc="handleCancel"
      >
        <section
          class="confirm-panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
        >
          <div class="confirm-top">
            <span class="confirm-icon" aria-hidden="true">!</span>
            <button class="confirm-close" type="button" aria-label="Close" :disabled="busy" @click="handleCancel">
              x
            </button>
          </div>

          <div class="confirm-copy">
            <p class="confirm-kicker">{{ eyebrow }}</p>
            <h3 :id="titleId">{{ title }}</h3>
            <p>{{ message }}</p>
          </div>

          <div v-if="itemName" class="confirm-item">
            <span>{{ itemLabel }}</span>
            <strong>{{ itemName }}</strong>
          </div>

          <div class="confirm-actions">
            <button class="confirm-btn secondary" type="button" :disabled="busy" @click="handleCancel">
              {{ cancelLabel }}
            </button>
            <button class="confirm-btn danger" type="button" :disabled="busy" @click="$emit('confirm')">
              {{ busy ? busyLabel : confirmLabel }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  busy: {
    type: Boolean,
    default: false
  },
  eyebrow: {
    type: String,
    default: 'Confirm action'
  },
  title: {
    type: String,
    default: 'Delete item?'
  },
  message: {
    type: String,
    default: 'This action cannot be undone.'
  },
  itemLabel: {
    type: String,
    default: 'Selected item'
  },
  itemName: {
    type: String,
    default: ''
  },
  confirmLabel: {
    type: String,
    default: 'Delete'
  },
  cancelLabel: {
    type: String,
    default: 'Cancel'
  },
  busyLabel: {
    type: String,
    default: 'Deleting...'
  }
})

const emit = defineEmits(['cancel', 'confirm'])
const titleId = `confirm-dialog-${Math.random().toString(36).slice(2)}`

const handleCancel = () => {
  if (!props.busy) {
    emit('cancel')
  }
}
</script>

<style scoped>
.confirm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
}

.confirm-panel {
  width: min(100%, 420px);
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
  outline: none;
}

.confirm-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 18px 0;
}

.confirm-icon {
  display: inline-grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fff1f2;
  color: #be123c;
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
}

.confirm-close {
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  font-size: 14px;
  font-weight: 800;
}

.confirm-close:hover:not(:disabled) {
  background: #f8fafc;
  color: #0f172a;
}

.confirm-copy {
  padding: 14px 18px 0;
}

.confirm-kicker {
  margin: 0 0 6px;
  color: #be123c;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.confirm-copy h3 {
  margin: 0;
  color: #0f172a;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0;
}

.confirm-copy p:last-child {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
}

.confirm-item {
  display: grid;
  gap: 4px;
  margin: 16px 18px 0;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.confirm-item span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.confirm-item strong {
  overflow-wrap: anywhere;
  color: #0f172a;
  font-size: 14px;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 18px;
  border-top: 1px solid #f1f5f9;
  margin-top: 18px;
}

.confirm-btn {
  min-width: 92px;
  height: 38px;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 0 14px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
}

.confirm-btn:disabled,
.confirm-close:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.confirm-btn.secondary {
  border-color: #cbd5e1;
  background: #ffffff;
  color: #334155;
}

.confirm-btn.secondary:hover:not(:disabled) {
  background: #f8fafc;
}

.confirm-btn.danger {
  background: #dc2626;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(220, 38, 38, 0.22);
}

.confirm-btn.danger:hover:not(:disabled) {
  background: #b91c1c;
}

.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.16s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}

@media (max-width: 520px) {
  .confirm-actions {
    flex-direction: column-reverse;
  }

  .confirm-btn {
    width: 100%;
  }
}
</style>
