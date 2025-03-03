<!--
EnhancedSelectComponent

This component is a customizable select input that supports both single and multiple selections.
It provides a dropdown interface with options that can be selected, and displays the selected
values either as text (for single selection) or as badges (for multiple selection).

Features:
- Single and multiple selection modes
- Keyboard navigation support
- Responsive dropdown positioning
- Empty state handling
- Accessible design with proper ARIA attributes

Props:
- modelValue: any | any[] - The selected value(s) (use with v-model)
- data: ISelectList[] - Array of options to display
- placeholder: string - Text to display when no option is selected
- label: string - Label for the select input
- id: string - Unique identifier for the component
- labelId: string - ID for the label element (for accessibility)
- multiple: boolean - Enable multiple selection mode

Events:
- update:modelValue - Emitted when the selection changes

Usage:
<EnhancedSelectComponent
  v-model="selectedValue"
  :data="options"
  placeholder="Select option(s)"
  label="Choose option(s)"
  id="my-select"
  :multiple="true"
/>

-->
<template>
  <div ref="selectRef" :id="`select_${id}`" class="relative w-full">
    <!-- Label -->
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      {{ label }}
    </label>
    <!-- Select Button -->
    <div
      tabindex="0"
      :id="id"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-labelledby="labelId"
      class="relative w-full min-h-[36px] px-4 py-2 text-left bg-white border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
      :class="{ 'text-gray-500': !hasSelectedValue }"
      @click="toggleDropdown"
      @keydown="handleKeyDown"
    >
      <!-- Sngle Selection display -->
      <div v-if="!multiple" class="flex items-center justify-between">
        <span>{{ displayText }}</span>
        <ChevronDownIcon
          class="w-5 h-5 transition-transform duration-200"
          :class="{ 'transform rotate-180': isOpen }"
        />
      </div>
      <div v-else class="flex flex-wrap items-center gap-2 pr-8">
        <template v-if="hasSelectedValue">
          <span
            v-for="value in modelValue"
            :key="value"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {{ getOptionText(value) }}
            <XIcon
              @click.stop="removeValue(value)"
              class="ml-1 h-3 w-3 text-blue-400 cursor-pointer hover:text-blue-600"
            />
          </span>
        </template>
        <span v-else>{{ placeholder }}</span>
        <ChevronDownIcon
          class="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </div>
    </div>
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg"
        :class="{ 'bottom-full mb-1': dropdownPosition === 'top' }"
      >
        <ul
          v-if="data.length > 0"
          role="listbox"
          :aria-labelledby="labelId"
          tabindex="-1"
          class="max-h-60 rounded-md border border-gray-300 bg-white py-1 text-base shadow-sm overflow-auto focus:outline-none sm:text-sm"
        >
          <li
            v-for="(option, index) in data"
            :key="option.value"
            :id="`${id}-option-${index}`"
            role="option"
            :aria-selected="isSelected(option.value)"
            @click="selectOption(option)"
            @mouseenter="activeIndex = index"
            tabindex="0"
            class="px-4 py-2 cursor-pointer hover:bg-gray-100"
            :class="{
              'bg-gray-200': isSelected(option.value),
              'bg-gray-100': activeIndex === index,
            }"
          >
            <div class="flex items-center">
              {{ option.text }}
            </div>
          </li>
        </ul>
        <div v-else class="px-4 py-2 text-sm text-gray-500">
          No options available
        </div>
      </div>
    </Transition>
    <span
      v-if="errorText"
      class="text-xs text-red-600 font-medium tracking-widest"
      >{{ errorText }}</span
    >
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { ChevronDownIcon, XIcon } from 'lucide-vue-next';
import type { ISelectList } from '@/models/basics';

interface Props {
  modelValue: any | any[];
  data: ISelectList[];
  placeholder?: string;
  label?: string;
  id: string;
  labelId?: string;
  multiple?: boolean;
  errorText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option',
  label: '',
  labelId: '',
  errorText: '',
  multiple: false,
});

const emit = defineEmits(['update:modelValue', 'blur']);

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const selectRef = ref<HTMLElement | null>(null);
const dropdownPosition = ref<'top' | 'bottom'>('bottom');
const activeIndex = ref(-1);

const hasSelectedValue = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.length > 0;
  }
  return !!props.modelValue;
});

const displayText = computed(() => {
  if (props.multiple) {
    return hasSelectedValue.value
      ? `${props.modelValue.length} selected`
      : props.placeholder;
  }
  const selectedOption = props.data.find(
    (option) => option.value === props.modelValue
  );
  return selectedOption ? selectedOption.text : props.placeholder;
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    nextTick(() => {
      updateDropdownPosition();
      activeIndex.value = props.data.findIndex(
        (option) => option.value === props.modelValue
      );
    });
  }
};

const selectOption = (option: ISelectList) => {
  if (props.multiple) {
    const newValue = Array.isArray(props.modelValue)
      ? [...props.modelValue]
      : [];
    const index = newValue.indexOf(option.value);
    if (index === -1) {
      newValue.push(option.value);
    } else {
      newValue.splice(index, 1);
    }
    emit('update:modelValue', newValue);
    emit('blur');
  } else {
    emit('update:modelValue', option.value);
    emit('blur');
    isOpen.value = false;
  }
};

const removeValue = (value: any) => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    const newValue = props.modelValue.filter((v) => v !== value);
    emit('update:modelValue', newValue);
  }
};

const isSelected = (value: any) => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(value);
  }
  return props.modelValue === value;
};

const getOptionText = (value: any) => {
  const option = props.data.find((opt) => opt.value === value);
  return option ? option.text : '';
};

const updateDropdownPosition = () => {
  if (!dropdownRef.value) return;
  const rect = dropdownRef.value.getBoundingClientRect();
  // @ts-ignore
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  dropdownPosition.value =
    spaceBelow < 100 && spaceAbove > spaceBelow ? 'top' : 'bottom';
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (selectRef.value && !selectRef.value.contains(target) && isOpen.value) {
    isOpen.value = false;
    emit('blur');
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (!isOpen.value && event.key === 'Enter') {
    toggleDropdown();
    return;
  }

  if (isOpen.value) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        activeIndex.value = (activeIndex.value + 1) % props.data.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        activeIndex.value =
          (activeIndex.value - 1 + props.data.length) % props.data.length;
        break;
      case 'Enter':
        event.preventDefault();
        if (activeIndex.value !== -1) {
          selectOption(props.data[activeIndex.value]);
        }
        break;
      case 'Escape':
        isOpen.value = false;
        break;
    }
  }
};

watch(activeIndex, (newIndex) => {
  if (newIndex !== -1 && dropdownRef.value) {
    const activeElement = dropdownRef.value.querySelector(
      `#${props.id}-option-${newIndex}`
    );
    if (activeElement) {
      activeElement.scrollIntoView({ block: 'nearest' });
    }
  }
});

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  // @ts-ignore
  window.addEventListener('resize', updateDropdownPosition);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  // @ts-ignore
  window.removeEventListener('resize', updateDropdownPosition);
});
</script>
