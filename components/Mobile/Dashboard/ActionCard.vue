<!-- components/MobileDashboardActionCard.vue -->
<template>
  <NuxtLink
    :to="to"
    :class="[
      'relative overflow-hidden rounded-2xl p-4 transition-all duration-300 active:scale-95',
      isFullWidthWhite
        ? 'bg-white dark:bg-slate-800 w-full border border-gray-200 dark:border-slate-700'
        : isPrimary
        ? 'bg-gradient-to-br'
        : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700',
      colorClasses,
    ]"
  >
    <!-- Background Pattern for Primary Cards -->
    <div
      v-if="isPrimary && !isFullWidthWhite"
      class="absolute inset-0 opacity-10 dark:opacity-5"
    >
      <div
        class="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/20 dark:bg-white/10"
      ></div>
      <div
        class="absolute -left-4 -bottom-4 w-32 h-32 rounded-full bg-white/10 dark:bg-white/5"
      ></div>
    </div>

    <!-- Content -->
    <div class="relative z-10">
      <!-- Icon -->
      <div class="flex items-center gap-2 mb-8">
        <div
          :class="[
            'inline-flex p-2.5 rounded-xl',
            isFullWidthWhite
              ? iconBgClasses
              : isPrimary
              ? 'bg-white/20 dark:bg-black/20'
              : iconBgClasses,
          ]"
        >
          <img
            v-if="iconImage"
            src="~/assets/img/whatsapp.png"
            alt="WhatsApp"
            class="w-6 h-6"
          />
          <UIcon
            v-else
            :name="icon"
            :class="[
              'w-6 h-6',
              isFullWidthWhite
                ? iconColorClasses
                : isPrimary
                ? 'text-slate-800 dark:text-white'
                : iconColorClasses,
            ]"
          />
        </div>
        <h4
          :class="[
            'font-semibold text-sm',
            isPrimary 
              ? 'text-slate-800 dark:text-white' 
              : 'text-gray-900 dark:text-white',
          ]"
        >
          {{ title }}
        </h4>
      </div>
      <!-- Text -->
      <p
        v-if="subtitle"
        :class="[
          'text-md mt-0.5',
          isPrimary 
            ? 'text-slate-800 dark:text-gray-200' 
            : 'text-slate-600 dark:text-gray-400',
        ]"
      >
        {{ subtitle }}
      </p>
    </div>

    <!-- Arrow for primary cards -->
    <div v-if="isPrimary" class="absolute bottom-3 right-3">
      <UIcon 
        name="i-heroicons-arrow-right" 
        class="w-4 h-4 text-slate-800 dark:text-white" 
      />
    </div>
  </NuxtLink>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  iconImage: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    default: "amber",
    validator: (value) => ["amber", "green", "slate"].includes(value),
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
  isFullWidthWhite: {
    type: Boolean,
    default: false,
  },
});

const colorClasses = computed(() => {
  if (props.isPrimary) {
    const gradients = {
      amber: "from-[#d7d3bf80] to-[#d7d3bf80] dark:from-yellow-600 dark:to-yellow-600",
      green: "from-[#fbe080] to-[#fbe080] dark:from-green-900/40 dark:to-green-800/40",
      slate: "from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700",
    };
    return gradients[props.color];
  }
  return "";
});

const iconBgClasses = computed(() => {
  const backgrounds = {
    amber: "bg-amber-100 dark:bg-amber-900/30",
    green: "bg-green-100 dark:bg-green-900/30",
    slate: "bg-slate-100 dark:bg-slate-800",
  };
  return backgrounds[props.color];
});

const iconColorClasses = computed(() => {
  const colors = {
    amber: "text-amber-600 dark:text-amber-400",
    green: "text-green-600 dark:text-green-400",
    slate: "text-slate-700 dark:text-slate-300",
  };
  return colors[props.color];
});
</script>