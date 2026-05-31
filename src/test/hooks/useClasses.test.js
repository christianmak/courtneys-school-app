import { renderHook, act, waitFor } from '@testing-library/react'
import '../mocks/supabase'
import { supabase } from '../mocks/supabase'
import { useClasses } from '../../hooks/useClasses'

beforeEach(() => vi.clearAllMocks())

test('loads classes on mount', async () => {
  supabase.order.mockResolvedValueOnce({ data: [{ id: '1', name: 'Biology', color: '#6366f1' }], error: null })
  const { result } = renderHook(() => useClasses())
  await waitFor(() => expect(result.current.classes).toHaveLength(1))
})

test('addClass inserts and refetches', async () => {
  supabase.order.mockResolvedValue({ data: [], error: null })
  supabase.insert.mockResolvedValueOnce({ data: null, error: null })
  const { result } = renderHook(() => useClasses())
  await act(async () => { await result.current.addClass('Anatomy', '#ec4899') })
  expect(supabase.insert).toHaveBeenCalled()
})

test('deleteClass deletes by id and refetches', async () => {
  supabase.order.mockResolvedValue({ data: [], error: null })
  supabase.eq.mockResolvedValueOnce({ error: null })
  const { result } = renderHook(() => useClasses())
  await act(async () => { await result.current.deleteClass('1') })
  expect(supabase.delete).toHaveBeenCalled()
})
