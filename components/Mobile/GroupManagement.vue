<!-- components/MobileGroupManagement.vue -->
<template>
  <USlideover v-model="isOpen" :ui="{ width: 'max-w-md' }">
    <div class="h-full flex flex-col bg-white dark:bg-slate-900">
      <!-- Header -->
      <div class="px-4 py-4 border-b border-gray-200 dark:border-slate-700">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('contact.groups.manage_title') }}
          </h2>
          <button
            @click="isOpen = false"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Add New Group -->
      <div class="px-4 py-4 border-b border-gray-200 dark:border-slate-700">
        <form @submit.prevent="addNewGroup" class="flex gap-2">
          <UInput
            v-model="newGroupName"
            :placeholder="$t('contact.groups.name_placeholder')"
            size="md"
            class="flex-1"
          />
          <UButton
            type="submit"
            color="amber"
            :disabled="!newGroupName.trim()"
          >
            {{ $t('contact.groups.create_button') }}
          </UButton>
        </form>
      </div>

      <!-- Groups List -->
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="!groups || groups.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-user-group" class="w-8 h-8 text-gray-400" />
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {{ $t('contact.groups.no_groups') }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-500">
            {{ $t('contact.groups.create_first_group') }}
          </p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="group in groups"
            :key="group.id"
            class="group flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 bg-white dark:bg-slate-700 rounded-lg">
                <UIcon name="i-heroicons-tag" class="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ group.name }}
                </p>
                <p v-if="group.contacts_count !== undefined" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ group.contacts_count }} {{ $t('contact.groups.contacts') }}
                </p>
              </div>
            </div>
            <button
              @click="deleteGroup(group.id)"
              class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
            >
              <UIcon name="i-heroicons-trash" class="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div v-if="groups && groups.length > 0" class="px-4 py-3 border-t border-gray-200 dark:border-slate-700">
        <p class="text-sm text-gray-600 dark:text-gray-400 text-center">
          {{ groups.length }} {{ $t('contact.groups.totals') }}
        </p>
      </div>
    </div>
  </USlideover>
</template>

<script setup>
import { ref, computed } from 'vue';
const { t } = useI18n();

const props = defineProps({
  modelValue: Boolean,
  groups: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'add', 'delete']);

const newGroupName = ref('');

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const addNewGroup = () => {
  if (newGroupName.value.trim()) {
    emit('add', newGroupName.value.trim());
    newGroupName.value = '';
  }
};

const deleteGroup = (groupId) => {
  if (confirm(t('contact.groups.confirm_delete'))) {
    emit('delete', groupId);
  }
};
</script>