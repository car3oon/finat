<script setup lang="ts">
/**
 * CommentsSection — wyświetla sekcję komentarzy dla wybranego zdjęcia.
 * Obsługuje stany ładowania (skeleton), błędu z możliwością ponowienia,
 * braku komentarzy oraz listę komentarzy.
 */
const SKELETON_COUNT = 3

const props = defineProps<{
  photoId: string
}>()

const { comments, status, error, refresh } = usePhotoComments(
  () => props.photoId
)

// Dodatkowo traktuję status 'idle' jako stan ładowania, aby przy server: false
// wyświetlać skeleton podczas SSR i hydratacji zamiast pustego stanu.
const isLoading = computed(
  () => status.value === 'pending' || status.value === 'idle'
)
</script>

<template>
  <section
    aria-labelledby="comments-heading"
    :aria-busy="isLoading"
    class="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm"
  >
    <div class="flex items-center gap-2.5 pb-4 mb-6">
      <h2 id="comments-heading" class="text-lg font-semibold text-gray-900 m-0">
        Komentarze
      </h2>
      <span
        v-if="status === 'success'"
        class="text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-2.5 py-0.5"
      >
        {{ comments.length }}
      </span>
    </div>

    <div v-if="isLoading" class="space-y-6" aria-label="Ładowanie komentarzy">
      <div
        v-for="index in SKELETON_COUNT"
        :key="`skeleton-${index}`"
        class="flex items-start gap-3.5 animate-pulse"
      >
        <div class="h-12 w-12 rounded-full bg-gray-200 shrink-0" />
        <div class="flex-1 space-y-2 pt-0.5">
          <div class="flex items-center gap-2.5">
            <div class="h-4 w-28 bg-gray-200 rounded" />
            <div class="h-3 w-20 bg-gray-100 rounded" />
          </div>
          <div class="h-4 w-full max-w-md bg-gray-200 rounded" />
        </div>
      </div>
    </div>

    <div
      v-else-if="error"
      role="alert"
      class="text-center py-6 px-4 rounded-lg bg-red-50 border border-red-200"
    >
      <p class="text-sm font-medium text-red-800 mb-1 mt-0">
        Nie udało się załadować komentarzy.
      </p>
      <button
        type="button"
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
        @click="refresh()"
      >
        Spróbuj ponownie
      </button>
    </div>

    <div
      v-else-if="comments.length === 0"
      class="text-center py-8 text-gray-500"
    >
      <p class="text-sm m-0">Brak komentarzy dla tego zdjęcia.</p>
    </div>

    <ul v-else class="divide-y divide-gray-100 list-none p-0 m-0">
      <li
        v-for="comment in comments"
        :key="comment.id"
        class="py-5 first:pt-0 last:pb-0"
      >
        <CommentsItem :comment="comment" />
      </li>
    </ul>
  </section>
</template>
