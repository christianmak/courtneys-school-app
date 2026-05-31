import { useState } from 'react'
import AppShell from './components/layout/AppShell'
import { useClasses } from './hooks/useClasses'
import { useTopics } from './hooks/useTopics'

export default function App() {
  const { classes, addClass } = useClasses()
  const [activeClassId, setActiveClassId] = useState(null)
  const { topics, addTopic } = useTopics(activeClassId)
  const [activeTopicId, setActiveTopicId] = useState(null)

  const handleAddClass = async () => { const name = prompt('Class name:'); if (!name) return; await addClass(name) }
  const handleAddTopic = async () => { const name = prompt('Topic name:'); if (!name) return; await addTopic(name) }
  const handleSelectClass = (id) => { setActiveClassId(id); setActiveTopicId(null) }

  return (
    <AppShell classes={classes} activeClassId={activeClassId} onSelectClass={handleSelectClass} onAddClass={handleAddClass}
      topics={topics} activeTopicId={activeTopicId} onSelectTopic={setActiveTopicId} onAddTopic={handleAddTopic}>
      <p style={{ color: '#9ca3af' }}>Select a topic to get started.</p>
    </AppShell>
  )
}
