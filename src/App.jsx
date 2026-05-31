import { useState } from 'react'
import AppShell from './components/layout/AppShell'
import { useClasses } from './hooks/useClasses'

export default function App() {
  const { classes, addClass } = useClasses()
  const [activeClassId, setActiveClassId] = useState(null)

  const handleAddClass = async () => {
    const name = prompt('Class name:'); if (!name) return; await addClass(name)
  }

  return (
    <AppShell classes={classes} activeClassId={activeClassId} onSelectClass={setActiveClassId} onAddClass={handleAddClass}
      topics={[]} activeTopicId={null} onSelectTopic={() => {}} onAddTopic={() => {}}>
      <p style={{ color: '#9ca3af' }}>Select a class and topic to get started.</p>
    </AppShell>
  )
}
