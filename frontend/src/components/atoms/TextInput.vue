<script setup>
/**
 * TextInput - Input texte avec label optionnel
 * Design System: Phenom Search
 */

defineOptions({ name: "TextInput" });

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  error: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  autocomplete: {
    type: String,
    default: "off",
  },
});

const emit = defineEmits(["update:modelValue", "blur", "focus"]);

const handleInput = (e) => {
  emit("update:modelValue", e.target.value);
};
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label
      v-if="label"
      class="block mb-2 text-xs uppercase tracking-wider text-white/60"
    >
      {{ label }}
      <span v-if="required" class="text-[#00F0FF]">*</span>
    </label>

    <!-- Input Container -->
    <div class="relative">
      <!-- Left Icon Slot -->
      <div
        v-if="$slots.leftIcon"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
      >
        <slot name="leftIcon" />
      </div>

      <!-- Input -->
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :class="[
          'w-full py-3 bg-white/5 border text-white',
          'placeholder:text-white/40',
          'focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/20',
          'transition-all duration-200',
          $slots.leftIcon ? 'pl-10 pr-4' : 'px-4',
          $slots.rightIcon ? 'pr-10' : '',
          error ? 'border-red-500/50' : 'border-white/10',
          { 'opacity-50 cursor-not-allowed': disabled },
        ]"
        @input="handleInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />

      <!-- Right Icon Slot -->
      <div
        v-if="$slots.rightIcon"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
      >
        <slot name="rightIcon" />
      </div>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="mt-2 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>
