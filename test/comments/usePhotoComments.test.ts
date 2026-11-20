import { ref, defineComponent, type MaybeRefOrGetter } from 'vue'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { clearNuxtData, createError } from 'nuxt/app'
import { usePhotoComments } from '../../app/composables/usePhotoComments'
import type { PhotoComment } from '../../app/types/comments'

const apiComments: PhotoComment[] = [
  {
    id: '1001',
    photoId: '1',
    author: 'Jan Kowalski',
    avatar: 'https://example.com/jan.jpg',
    content: 'Pierwszy komentarz',
    createdAt: '2026-01-15T10:30:00.000Z'
  },
  {
    id: '2002',
    photoId: '2',
    author: 'Anna Nowak',
    avatar: '',
    content: 'Komentarz do innego zdjęcia',
    createdAt: '2026-01-16T12:00:00.000Z'
  },
  {
    id: '3003',
    photoId: '1',
    author: 'Piotr Zieliński',
    avatar: '',
    content: 'Drugi komentarz',
    createdAt: '2026-01-17T14:00:00.000Z'
  }
]

const endpointHandler = vi.fn<() => Promise<PhotoComment[]>>()

registerEndpoint('/api/comments.json', () => endpointHandler())

async function setupComposable(photoId: MaybeRefOrGetter<string>) {
  let result!: ReturnType<typeof usePhotoComments>

  const TestComponent = defineComponent({
    setup() {
      result = usePhotoComments(photoId)
      return () => null
    }
  })

  await mountSuspended(TestComponent)
  return result
}

describe('usePhotoComments', () => {
  beforeEach(() => {
    clearNuxtData()
    endpointHandler.mockReset()
    endpointHandler.mockResolvedValue(apiComments)
  })

  it('fetches comments and filters them by photoId', async () => {
    const { comments, status, error } = await setupComposable('1')

    await vi.waitFor(() => {
      expect(status.value).toBe('success')
    })

    expect(error.value).toBeUndefined()
    expect(comments.value).toHaveLength(2)
    expect(comments.value.map((c: PhotoComment) => c.id)).toEqual([
      '1001',
      '3003'
    ])
  })

  it('returns an empty array when no comments match photoId', async () => {
    const { comments, status } = await setupComposable('999')

    await vi.waitFor(() => {
      expect(status.value).toBe('success')
    })

    expect(comments.value).toEqual([])
  })

  it('reactively updates filtered comments when photoId changes', async () => {
    const photoId = ref('1')
    const { comments, status } = await setupComposable(photoId)

    await vi.waitFor(() => {
      expect(status.value).toBe('success')
    })

    expect(comments.value.map((c: PhotoComment) => c.id)).toEqual([
      '1001',
      '3003'
    ])

    photoId.value = '2'
    expect(comments.value.map((c: PhotoComment) => c.id)).toEqual(['2002'])
  })

  it('exposes error state when API request fails and recovers on refresh', async () => {
    endpointHandler.mockRejectedValue(
      createError({ statusCode: 500, statusMessage: 'Server failure' })
    )

    const { comments, status, error, refresh } = await setupComposable('1')

    await vi.waitFor(() => expect(status.value).toBe('error'))

    expect(error.value).toBeTruthy()
    expect(comments.value).toEqual([])

    endpointHandler.mockResolvedValue(apiComments)
    await refresh()

    expect(status.value).toBe('success')
    expect(error.value).toBeUndefined()
    expect(comments.value).toHaveLength(2)
  })
})
