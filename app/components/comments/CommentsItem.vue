<script setup lang="ts">
/**
 * CommentsItem — wyświetla pojedynczy komentarz z avatarem (lub inicjałami jako fallback),
 * autorem, sformatowaną datą publikacji oraz treścią.
 */
import type { PhotoComment } from '../../types/comments'

const props = defineProps<{
  comment: PhotoComment
}>()

const avatarFailed = ref(false)

const initials = computed(() => {
  const parts = props.comment.author.trim().split(' ').filter(Boolean)
  const firstName = parts.at(0)
  const lastName = parts.at(-1)

  if (!firstName || !lastName) return '?'
  if (parts.length === 1) return firstName.slice(0, 2).toUpperCase()

  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
})
</script>

<template>
  <article class="flex items-start gap-3.5">
    <div class="shrink-0">
      <img
        v-if="comment.avatar && !avatarFailed"
        :src="comment.avatar"
        :alt="comment.author"
        width="48"
        height="48"
        loading="lazy"
        class="h-12 w-12 rounded-full object-cover bg-gray-100 ring-1 ring-black/15"
        @error="avatarFailed = true"
      />
      <div
        v-else
        aria-hidden="true"
        class="h-12 w-12 rounded-full bg-gray-100 text-gray-600 text-base font-bold flex items-center justify-center ring-1 ring-black/15"
      >
        {{ initials }}
      </div>
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
        <span class="text-sm font-semibold text-gray-900">
          {{ comment.author }}
        </span>
        <NuxtTime
          :datetime="comment.createdAt"
          locale="pl-PL"
          day="numeric"
          month="short"
          year="numeric"
          hour="2-digit"
          minute="2-digit"
          class="text-xs text-gray-400"
        />
      </div>
      <p
        class="mt-1.5 mb-0 text-sm text-gray-600 leading-relaxed whitespace-pre-line break-words"
      >
        {{ comment.content }}
      </p>
    </div>
  </article>
</template>
