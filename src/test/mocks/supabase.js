export const supabase = {
  from: vi.fn(() => supabase),
  select: vi.fn(() => supabase),
  insert: vi.fn(() => supabase),
  update: vi.fn(() => supabase),
  delete: vi.fn(() => supabase),
  eq: vi.fn(() => supabase),
  order: vi.fn(() => supabase),
  single: vi.fn(() => supabase),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/img.jpg' } })),
    })),
  },
}

vi.mock('../../lib/supabase', () => ({ supabase }))
