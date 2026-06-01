import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useNotes(topicId) {
  const [notes, setNotes] = useState([])

  const fetchNotes = useCallback(async () => {
    if (!topicId) { setNotes([]); return }
    const { data } = await supabase.from('notes').select('*').eq('topic_id', topicId).order('updated_at', { ascending: false })
    if (data) setNotes(data)
  }, [topicId])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const addNote = async (title) => {
    const { error } = await supabase.from('notes').insert({ topic_id: topicId, title, content: { strokes: [], version: 1 } })
    if (error) throw error
    await fetchNotes()
  }

  const updateNoteContent = async (id, content) => {
    const { error } = await supabase.from('notes').update({ content, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
  }

  const deleteNote = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) throw error
    await fetchNotes()
  }

  return { notes, addNote, updateNoteContent, deleteNote }
}

export async function uploadNoteImage(topicId, noteId, file) {
  const path = `notes/${topicId}/${noteId}/${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('diagrams').upload(path, file)
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from('diagrams').getPublicUrl(path)
  return publicUrl
}
