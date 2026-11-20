import { ref, toValue } from 'vue'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import CommentsSection from '../../app/components/comments/CommentsSection.vue'
import CommentsItem from '../../app/components/comments/CommentsItem.vue'
import type { PhotoComment } from '../../app/types/comments'

const { usePhotoCommentsMock } = vi.hoisted(() => ({
  usePhotoCommentsMock: vi.fn()
}))

mockNuxtImport('usePhotoComments', () => usePhotoCommentsMock)

const mockComments: PhotoComment[] = [
  {
    id: '1001',
    photoId: '1',
    author: 'Jan Kowalski',
    avatar: 'https://example.com/jan.jpg',
    content: 'Świetne światło!',
    createdAt: '2026-01-15T10:30:00.000Z'
  },
  {
    id: '2002',
    photoId: '1',
    author: 'Anna Nowak',
    avatar: '',
    content: 'Bardzo dobry kadr.',
    createdAt: '2026-01-16T12:00:00.000Z'
  }
]

const setupMock = ({
  comments = [],
  status = 'success',
  error = null,
  refresh = vi.fn()
}: {
  comments?: PhotoComment[]
  status?: 'idle' | 'pending' | 'success' | 'error'
  error?: Error | null
  refresh?: ReturnType<typeof vi.fn>
} = {}) => {
  usePhotoCommentsMock.mockReturnValue({
    comments: ref(comments),
    status: ref(status),
    error: ref(error),
    refresh
  })

  return { refresh }
}

describe('CommentsSection', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it.each(['idle', 'pending'] as const)(
    'renders loading state with aria-busy="true" when status is "%s"',
    async (status) => {
      setupMock({ status })

      const wrapper = await mountSuspended(CommentsSection, {
        props: { photoId: '1' }
      })

      expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true)
      expect(wrapper.findAllComponents(CommentsItem)).toHaveLength(0)
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    }
  )

  it('renders error alert and triggers refresh on retry click', async () => {
    const { refresh } = setupMock({
      status: 'error',
      error: new Error('Network error')
    })

    const wrapper = await mountSuspended(CommentsSection, {
      props: { photoId: '1' }
    })

    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(wrapper.find('[aria-busy="false"]').exists()).toBe(true)

    const retryButton = alert.find('button')
    expect(retryButton.exists()).toBe(true)

    await retryButton.trigger('click')
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('renders empty state when loaded with no comments', async () => {
    setupMock({ status: 'success', comments: [] })

    const wrapper = await mountSuspended(CommentsSection, {
      props: { photoId: '1' }
    })

    expect(wrapper.find('[aria-busy="false"]').exists()).toBe(true)
    expect(wrapper.findAllComponents(CommentsItem)).toHaveLength(0)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.find('#comments-heading + span').text()).toBe('0')
  })

  it('renders comments list, count and passes photoId to composable', async () => {
    setupMock({ status: 'success', comments: mockComments })

    const wrapper = await mountSuspended(CommentsSection, {
      props: { photoId: '1' }
    })

    expect(usePhotoCommentsMock).toHaveBeenCalledTimes(1)
    expect(toValue(usePhotoCommentsMock.mock.calls[0][0])).toBe('1')

    const items = wrapper.findAllComponents(CommentsItem)
    expect(items).toHaveLength(2)
    expect(wrapper.find('#comments-heading + span').text()).toBe('2')
    expect(wrapper.text()).toContain('Świetne światło!')
    expect(wrapper.text()).toContain('Bardzo dobry kadr.')
    expect(wrapper.find('[aria-busy="false"]').exists()).toBe(true)
  })
})
