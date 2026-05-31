import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useClasses() {
  const [classes, setClasses] = useState([])

  const fetchClasses = useCallback(async () => {
    const { data } = await supabase.from('classes').select('*').order('name')
    if (data) setClasses(data)
  }, [])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  const addClass = async (name, color = '#6366f1') => {
    await supabase.from('classes').insert({ name, color }).single()
    await fetchClasses()
  }

  const deleteClass = async (id) => {
    await supabase.from('classes').delete().eq('id', id)
    await fetchClasses()
  }

  return { classes, addClass, deleteClass }
}
