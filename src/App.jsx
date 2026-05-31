import { useState } from 'react'
import AppShell from './components/layout/AppShell'
import NotesList from './components/notes/NotesList'
import NoteEditor from './components/notes/NoteEditor'
import DiagramList from './components/diagrams/DiagramList'
import DiagramSetup from './components/diagrams/DiagramSetup'
import LabeledSetup from './components/diagrams/LabeledSetup'
import { useClasses } from './hooks/useClasses'
import { useTopics } from './hooks/useTopics'
import { useNotes } from './hooks/useNotes'
import { useDiagrams } from './hooks/useDiagrams'

export default function App() {
  const { classes, addClass } = useClasses()
  const [activeClassId, setActiveClassId] = useState(null)
  const { topics, addTopic } = useTopics(activeClassId)
  const [activeTopicId, setActiveTopicId] = useState(null)
  const { notes, addNote, updateNoteContent } = useNotes(activeTopicId)
  const { diagrams, addDiagram, addLabel, addLabels, getLabels } = useDiagrams(activeTopicId)
  const [activeNote, setActiveNote] = useState(null)
  const [activeDiagram, setActiveDiagram] = useState(null)
  const [view, setView] = useState('notes')

  const handleAddClass = async () => { const name = prompt('Class name:'); if (!name) return; await addClass(name) }
  const handleAddTopic = async () => { const name = prompt('Topic name:'); if (!name) return; await addTopic(name) }
  const handleAddNote = async () => { const title = prompt('Note title:'); if (!title) return; await addNote(title) }
  const handleSelectClass = (id) => { setActiveClassId(id); setActiveTopicId(null); setActiveNote(null); setActiveDiagram(null); setView('notes') }
  const handleSelectTopic = (id) => { setActiveTopicId(id); setActiveNote(null); setActiveDiagram(null); setView('notes') }
  const handleUploadDiagram = async (name, file, mode) => { await addDiagram(name, file, mode); setView('diagrams') }

  const renderContent = () => {
    if (activeNote) return <NoteEditor note={activeNote} onSave={(c) => updateNoteContent(activeNote.id, c)} onBack={() => setActiveNote(null)} />
    if (activeDiagram && activeDiagram.mode === 'labeled') {
      return (
        <LabeledSetup
          diagram={activeDiagram}
          onSaveLabels={(labels) => addLabels(activeDiagram.id, labels)}
          onDone={() => setActiveDiagram(null)}
        />
      )
    }
    if (activeDiagram && activeDiagram.mode === 'clean') {
      return <div><button onClick={() => setActiveDiagram(null)}>← Back</button><p style={{marginTop:'8px',color:'#9ca3af'}}>Clean setup coming soon (Task 10).</p></div>
    }
    if (activeDiagram) return <div><button onClick={() => setActiveDiagram(null)} style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', background: '#fff' }}>← Back</button></div>
    if (view === 'addDiagram') return <DiagramSetup onUpload={handleUploadDiagram} />
    if (!activeTopicId) return <p style={{ color: '#9ca3af' }}>Select a topic to get started.</p>
    return (
      <div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['notes', 'diagrams'].map((v) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: view === v ? '#6366f1' : '#e5e7eb', color: view === v ? '#fff' : '#374151', cursor: 'pointer', textTransform: 'capitalize' }}>{v}</button>
          ))}
        </div>
        {view === 'notes' && <NotesList notes={notes} onSelect={setActiveNote} onAdd={handleAddNote} />}
        {view === 'diagrams' && <DiagramList diagrams={diagrams} onSelect={setActiveDiagram} onAdd={() => setView('addDiagram')} />}
      </div>
    )
  }

  return (
    <AppShell classes={classes} activeClassId={activeClassId} onSelectClass={handleSelectClass} onAddClass={handleAddClass}
      topics={topics} activeTopicId={activeTopicId} onSelectTopic={handleSelectTopic} onAddTopic={handleAddTopic}>
      {renderContent()}
    </AppShell>
  )
}
