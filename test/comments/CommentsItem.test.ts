import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CommentsItem from '../../app/components/comments/CommentsItem.vue'
import type { PhotoComment } from '../../app/types/comments'

const createComment = (
  overrides: Partial<PhotoComment> = {}
): PhotoComment => ({
  id: '1001',
  photoId: '1',
  author: 'Jan Kowalski',
  avatar: 'https://example.com/avatar.jpg',
  content: 'Świetne zdjęcie!',
  createdAt: '2026-01-15T10:30:00Z',
  ...overrides
})

describe('CommentsItem', () => {
  it('renders author, content and publication date', async () => {
    const comment = createComment()
    const wrapper = await mountSuspended(CommentsItem, {
      props: { comment }
    })

    expect(wrapper.text()).toContain('Jan Kowalski')
    expect(wrapper.text()).toContain('Świetne zdjęcie!')

    const time = wrapper.find('time')
    expect(time.exists()).toBe(true)
    expect(time.attributes('datetime')).toBe('2026-01-15T10:30:00.000Z')
    expect(time.text()).toBeTruthy()
  })

  it('renders avatar image when avatar URL is provided', async () => {
    const wrapper = await mountSuspended(CommentsItem, {
      props: { comment: createComment() }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/avatar.jpg')
    expect(img.attributes('alt')).toBe('Jan Kowalski')
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(false)
  })

  it('renders initials fallback when avatar URL is missing', async () => {
    const wrapper = await mountSuspended(CommentsItem, {
      props: { comment: createComment({ avatar: '' }) }
    })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('[aria-hidden="true"]').text()).toBe('JK')
  })

  it('falls back to initials when avatar fails to load', async () => {
    const wrapper = await mountSuspended(CommentsItem, {
      props: { comment: createComment() }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)

    await img.trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('[aria-hidden="true"]').text()).toBe('JK')
  })

  it.each([
    ['Jan Kowalski', 'JK'],
    ['  Jan   Adam   Kowalski  ', 'JK'],
    ['Admin', 'AD'],
    ['A', 'A'],
    ['   ', '?'],
    ['', '?']
  ] as const)(
    'computes initials for author "%s" as "%s"',
    async (author, expected) => {
      const wrapper = await mountSuspended(CommentsItem, {
        props: { comment: createComment({ author, avatar: '' }) }
      })

      expect(wrapper.find('[aria-hidden="true"]').text()).toBe(expected)
    }
  )
})
