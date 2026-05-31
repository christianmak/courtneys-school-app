import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTopics(classId) {
  const [topics, setTopics] = useState([])

  const fetchTopics = useCallback(async () => {
    if (!classId) { setTopics([]); return }
    const { data } = await supabase.from('topics').select('*').eq('class_id', classId).order('name')
    if (data) setTopics(data)
  }, [classId])

  useEffect(() => { fetchTopics() }, [fetchTopics])

  const addTopic = async (name) => {
    const { error } = await supabase.from('topics').insert({ class_id: classId, name })
    if (error) throw error
    await fetchTopics()
  }

  const deleteTopic = async (id) => {
    const { error } = await supabase.from('topics').delete().eq('id', id)
    if (error) throw error
    await fetchTopics()
  }

  return { topics, addTopic, deleteTopic }
}
