import { useState } from 'react'
import AppShell from './components/layout/AppShell'
import NotesList from './components/notes/NotesList'
import NoteEditor from './components/notes/NoteEditor'
import DiagramList from './components/diagrams/DiagramList'
import DiagramSetup from './components/diagrams/DiagramSetup'
import LabeledSetup from './components/diagrams/LabeledSetup'
import CleanSetup from './components/diagrams/CleanSetup'
import QuizMode from './components/diagrams/QuizMode'
import { useClasses } from './hooks/useClasses'
import { useTopics } from './hooks/useTopics'
import { useNotes } from './hooks/useNotes'
import { useDiagrams } from './hooks/useDiagrams'

export default function App() {
  const { classes, addClass, deleteClass } = useClasses()
  const [activeClassId, setActiveClassId] = useState(null)
  const { topics, addTopic, deleteTopic } = useTopics(activeClassId)
  const [activeTopicId, setActiveTopicId] = useState(null)
  const { notes, addNote, updateNoteContent, deleteNote } = useNotes(activeTopicId)
  const { diagrams, addDiagram, deleteDiagram, addLabel, addLabels, getLabels } = useDiagrams(activeTopicId)
  const [activeNote, setActiveNote] = useState(null)
  const [activeDiagram, setActiveDiagram] = useState(null)
  const [quizDiagram, setQuizDiagram] = useState(null)
  const [quizLabels, setQuizLabels] = useState([])
  const [view, setView] = useState('notes')

  const handleAddClass = async () => { const name = prompt('Class name:'); if (!name) return; await addClass(name) }
  const handleAddTopic = async () => { const name = prompt('Topic name:'); if (!name) return; await addTopic(name) }
  const handleAddNote = async () => { const title = prompt('Note title:'); if (!title) return; await addNote(title) }
  const handleSelectClass = (id) => { setActiveClassId(id); setActiveTopicId(null); setActiveNote(null); setActiveDiagram(null); setQuizDiagram(null); setQuizLabels([]); setView('notes') }
  const handleSelectTopic = (id) => { setActiveTopicId(id); setActiveNote(null); setActiveDiagram(null); setQuizDiagram(null); setQuizLabels([]); setView('notes') }
  const handleUploadDiagram = async (name, file, mode) => { await addDiagram(name, file, mode); setView('diagrams') }
  const handleOpenDiagram = async (diagram) => {
    const labels = await getLabels(diagram.id)
    if (labels.length === 0) { setActiveDiagram(diagram); return }
    setQuizLabels(labels)
    setQuizDiagram(diagram)
  }

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Delete this class and all its topics and notes?')) return
    await deleteClass(id)
    setActiveClassId(null)
    setActiveTopicId(null)
    setActiveNote(null)
    setView('notes')
  }

  const handleDeleteTopic = async (id) => {
    if (!window.confirm('Delete this topic and all its notes and diagrams?')) return
    await deleteTopic(id)
    setActiveTopicId(null)
    setActiveNote(null)
    setView('notes')
  }

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return
    await deleteNote(id)
    if (activeNote?.id === id) setActiveNote(null)
  }

  const handleDeleteDiagram = async (id) => {
    if (!window.confirm('Delete this diagram and its labels?')) return
    await deleteDiagram(id)
  }

  const renderContent = () => {
    if (quizDiagram) return <QuizMode diagram={quizDiagram} labels={quizLabels} onBack={() => { setQuizDiagram(null); setQuizLabels([]) }} />
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
      return (
        <CleanSetup
          diagram={activeDiagram}
          onSaveLabels={(labels) => addLabels(activeDiagram.id, labels)}
          onDone={() => setActiveDiagram(null)}
        />
      )
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
        {view === 'notes' && <NotesList notes={notes} onSelect={setActiveNote} onAdd={handleAddNote} onDelete={handleDeleteNote} />}
        {view === 'diagrams' && <DiagramList diagrams={diagrams} onSelect={handleOpenDiagram} onAdd={() => setView('addDiagram')} onDelete={handleDeleteDiagram} />}
      </div>
    )
  }

  return (
    <AppShell classes={classes} activeClassId={activeClassId} onSelectClass={handleSelectClass} onAddClass={handleAddClass} onDeleteClass={handleDeleteClass}
      topics={topics} activeTopicId={activeTopicId} onSelectTopic={handleSelectTopic} onAddTopic={handleAddTopic} onDeleteTopic={handleDeleteTopic}>
      {renderContent()}
    </AppShell>
  )
}
