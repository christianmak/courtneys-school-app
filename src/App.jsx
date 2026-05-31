import { useState } from 'react'
import AppShell from './components/layout/AppShell'
import NotesList from './components/notes/NotesList'
import { useClasses } from './hooks/useClasses'
import { useTopics } from './hooks/useTopics'
import { useNotes } from './hooks/useNotes'

export default function App() {
  const { classes, addClass } = useClasses()
  const [activeClassId, setActiveClassId] = useState(null)
  const { topics, addTopic } = useTopics(activeClassId)
  const [activeTopicId, setActiveTopicId] = useState(null)
  const { notes, addNote, updateNoteContent } = useNotes(activeTopicId)
  const [activeNote, setActiveNote] = useState(null)
  const [view, setView] = useState('notes')

  const handleAddClass = async () => { const name = prompt('Class name:'); if (!name) return; await addClass(name) }
  const handleAddTopic = async () => { const name = prompt('Topic name:'); if (!name) return; await addTopic(name) }
  const handleAddNote = async () => { const title = prompt('Note title:'); if (!title) return; await addNote(title) }
  const handleSelectClass = (id) => { setActiveClassId(id); setActiveTopicId(null); setActiveNote(null) }
  const handleSelectTopic = (id) => { setActiveTopicId(id); setActiveNote(null); setView('notes') }

  return (
    <AppShell classes={classes} activeClassId={activeClassId} onSelectClass={handleSelectClass} onAddClass={handleAddClass}
      topics={topics} activeTopicId={activeTopicId} onSelectTopic={handleSelectTopic} onAddTopic={handleAddTopic}>
      {activeTopicId
        ? <NotesList notes={notes} onSelect={setActiveNote} onAdd={handleAddNote} />
        : <p style={{ color: '#9ca3af' }}>Select a topic to get started.</p>}
    </AppShell>
  )
}
