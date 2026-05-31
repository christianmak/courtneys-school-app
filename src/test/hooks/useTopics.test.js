import { renderHook, act, waitFor } from '@testing-library/react'
import '../mocks/supabase'
import { supabase } from '../mocks/supabase'
import { useTopics } from '../../hooks/useTopics'

beforeEach(() => vi.clearAllMocks())

test('loads topics for a class', async () => {
  supabase.order.mockResolvedValueOnce({ data: [{ id: 't1', class_id: 'c1', name: 'Cell Biology' }], error: null })
  const { result } = renderHook(() => useTopics('c1'))
  await waitFor(() => expect(result.current.topics).toHaveLength(1))
})

test('returns empty array when classId is null', async () => {
  const { result } = renderHook(() => useTopics(null))
  await waitFor(() => expect(result.current.topics).toEqual([]))
})

test('addTopic inserts and refetches', async () => {
  supabase.order.mockResolvedValue({ data: [], error: null })
  supabase.insert.mockResolvedValueOnce({ data: null, error: null })
  const { result } = renderHook(() => useTopics('c1'))
  await act(async () => { await result.current.addTopic('Genetics') })
  expect(supabase.insert).toHaveBeenCalled()
})
