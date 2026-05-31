import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useDiagrams(topicId) {
  const [diagrams, setDiagrams] = useState([])

  const fetchDiagrams = useCallback(async () => {
    if (!topicId) { setDiagrams([]); return }
    const { data } = await supabase.from('diagrams').select('*').eq('topic_id', topicId).order('name')
    if (data) setDiagrams(data)
  }, [topicId])

  useEffect(() => { fetchDiagrams() }, [fetchDiagrams])

  const addDiagram = async (name, file, mode) => {
    const path = `${topicId}/${Date.now()}-${file.name}`
    await supabase.storage.from('diagrams').upload(path, file)
    const { data: { publicUrl } } = supabase.storage.from('diagrams').getPublicUrl(path)
    await supabase.from('diagrams').insert({ topic_id: topicId, name, image_url: publicUrl, mode })
    await fetchDiagrams()
  }

  const deleteDiagram = async (id) => {
    await supabase.from('diagram_labels').delete().eq('diagram_id', id)
    await supabase.from('diagrams').delete().eq('id', id)
    await fetchDiagrams()
  }

  const addLabel = async (diagramId, labelData) => {
    await supabase.from('diagram_labels').insert({ diagram_id: diagramId, ...labelData })
  }

  const addLabels = async (diagramId, labelsArray) => {
    if (!labelsArray.length) return
    await supabase.from('diagram_labels').insert(labelsArray.map((l) => ({ diagram_id: diagramId, ...l })))
  }

  const getLabels = async (diagramId) => {
    const { data } = await supabase.from('diagram_labels').select('*').eq('diagram_id', diagramId)
    return data ?? []
  }

  const deleteLabels = async (diagramId) => {
    await supabase.from('diagram_labels').delete().eq('diagram_id', diagramId)
  }

  return { diagrams, addDiagram, deleteDiagram, addLabel, addLabels, getLabels, deleteLabels }
}
