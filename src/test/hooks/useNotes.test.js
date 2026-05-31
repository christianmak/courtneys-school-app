import { renderHook, act, waitFor } from '@testing-library/react'
import '../mocks/supabase'
import { supabase } from '../mocks/supabase'
import { useNotes } from '../../hooks/useNotes'

beforeEach(() => vi.clearAllMocks())

test('loads notes for a topic', async () => {
  supabase.order.mockResolvedValueOnce({ data: [{ id: 'n1', topic_id: 't1', title: 'Lecture 1', content: { strokes: [], version: 1 }, updated_at: '2026-01-01' }], error: null })
  const { result } = renderHook(() => useNotes('t1'))
  await waitFor(() => expect(result.current.notes).toHaveLength(1))
})

test('returns empty array when topicId is null', async () => {
  const { result } = renderHook(() => useNotes(null))
  await waitFor(() => expect(result.current.notes).toEqual([]))
})

test('addNote inserts and refetches', async () => {
  supabase.order.mockResolvedValue({ data: [], error: null })
  supabase.insert.mockResolvedValueOnce({ data: null, error: null })
  const { result } = renderHook(() => useNotes('t1'))
  await act(async () => { await result.current.addNote('New Note') })
  expect(supabase.insert).toHaveBeenCalled()
})

test('updateNoteContent calls update with content and timestamp', async () => {
  supabase.order.mockResolvedValue({ data: [], error: null })
  supabase.eq.mockResolvedValueOnce({ error: null })
  const { result } = renderHook(() => useNotes('t1'))
  await act(async () => { await result.current.updateNoteContent('n1', { strokes: [], version: 1 }) })
  expect(supabase.update).toHaveBeenCalled()
})
