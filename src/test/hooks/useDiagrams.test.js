import { renderHook, act, waitFor } from '@testing-library/react'
import '../mocks/supabase'
import { supabase } from '../mocks/supabase'
import { useDiagrams } from '../../hooks/useDiagrams'

beforeEach(() => vi.clearAllMocks())

test('loads diagrams for a topic', async () => {
  supabase.order.mockResolvedValueOnce({ data: [{ id: 'd1', topic_id: 't1', name: 'Cell', image_url: 'https://x.com/img.jpg', mode: 'labeled' }], error: null })
  const { result } = renderHook(() => useDiagrams('t1'))
  await waitFor(() => expect(result.current.diagrams).toHaveLength(1))
})

test('returns empty array when topicId is null', async () => {
  const { result } = renderHook(() => useDiagrams(null))
  await waitFor(() => expect(result.current.diagrams).toEqual([]))
})

test('addDiagram uploads image and inserts record', async () => {
  supabase.order.mockResolvedValue({ data: [], error: null })
  supabase.single.mockResolvedValueOnce({ data: { id: 'd2' }, error: null })
  const { result } = renderHook(() => useDiagrams('t1'))
  const file = new File(['img'], 'cell.jpg', { type: 'image/jpeg' })
  await act(async () => { await result.current.addDiagram('Cell', file, 'labeled') })
  expect(supabase.storage.from).toHaveBeenCalledWith('diagrams')
})
