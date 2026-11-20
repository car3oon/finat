import type { MaybeRefOrGetter } from "vue";
import type { PhotoComment } from "../types/comments";

export function usePhotoComments(photoId: MaybeRefOrGetter<string>) {
  const { data, status, error, refresh } = useLazyFetch<PhotoComment[]>(
    "/api/comments.json",
    {
      key: "photo-comments",
      // public/api/comments.json jest zasobem statycznym i nie jest obsługiwany podczas SSR,
      // więc pobieram go na kliencie. Przy docelowym API opcja do usunięcia.
      server: false,
    },
  );

  const comments = computed(() => {
    if (!data.value) return [];

    // Filtrowanie po `photoId`
    const targetId = toValue(photoId);
    return data.value.filter((comment) => comment.photoId === targetId);
  });

  return {
    comments,
    status,
    error,
    refresh,
  };
}
