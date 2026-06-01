import { useState } from 'react'
import AppShell from './components/layout/AppShell'
import Toast from './components/layout/Toast'
import InputModal from './components/layout/InputModal'
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
import { useToast } from './hooks/useToast'

export default function App() {
  const { classes, addClass, deleteClass } = useClasses()
  const [activeClassId, setActiveClassId] = useState(null)
  const { topics, addTopic, deleteTopic } = useTopics(activeClassId)
  const [activeTopicId, setActiveTopicId] = useState(null)
  const { notes, addNote, updateNoteContent, deleteNote, renameNote } = useNotes(activeTopicId)
  const { diagrams, addDiagram, deleteDiagram, addLabel, addLabels, getLabels, deleteLabels } = useDiagrams(activeTopicId)
  const [activeNote, setActiveNote] = useState(null)
  const [activeDiagram, setActiveDiagram] = useState(null)
  const [quizDiagram, setQuizDiagram] = useState(null)
  const [quizLabels, setQuizLabels] = useState([])
  const [view, setView] = useState('notes')
  const { toast, showError, dismiss } = useToast()
  const [modal, setModal] = useState(null)
  // modal shape: { title, placeholder, onConfirm } | null

  const showModal = (title, placeholder, onConfirm) => {
    setModal({ title, placeholder, onConfirm })
  }
  const closeModal = () => setModal(null)

  const handleAddClass = () => {
    showModal('New class', 'e.g. Biology 101', async (name) => {
      closeModal()
      try {
        await addClass(name)
      } catch {
        showError('Failed to add class. Please try again.')
      }
    })
  }

  const handleAddTopic = () => {
    showModal('New topic', 'e.g. Cell Biology', async (name) => {
      closeModal()
      try {
        await addTopic(name)
      } catch {
        showError('Failed to add topic. Please try again.')
      }
    })
  }

  const handleAddNote = () => {
    showModal('New note', 'e.g. Lecture 1', async (title) => {
      closeModal()
      try {
        await addNote(title)
      } catch {
        showError('Failed to add note. Please try again.')
      }
    })
  }

  const handleSelectClass = (id) => { setActiveClassId(id); setActiveTopicId(null); setActiveNote(null); setActiveDiagram(null); setQuizDiagram(null); setQuizLabels([]); setView('notes') }
  const handleSelectTopic = (id) => { setActiveTopicId(id); setActiveNote(null); setActiveDiagram(null); setQuizDiagram(null); setQuizLabels([]); setView('notes') }

  const handleUploadDiagram = async (name, file, mode) => {
    try {
      await addDiagram(name, file, mode)
      setView('diagrams')
    } catch (err) {
      showError('Failed to upload diagram. Check your connection and try again.')
    }
  }

  const handleOpenDiagram = async (diagram) => {
    try {
      const labels = await getLabels(diagram.id)
      if (labels.length === 0) { setActiveDiagram(diagram); return }
      setQuizLabels(labels)
      setQuizDiagram(diagram)
    } catch (err) {
      showError('Failed to load diagram labels. Please try again.')
    }
  }

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Delete this class and all its topics and notes?')) return
    try {
      await deleteClass(id)
    } catch (err) {
      showError('Failed to delete class. Please try again.')
    }
    setActiveClassId(null)
    setActiveTopicId(null)
    setActiveNote(null)
    setView('notes')
  }

  const handleDeleteTopic = async (id) => {
    if (!window.confirm('Delete this topic and all its notes and diagrams?')) return
    try {
      await deleteTopic(id)
    } catch (err) {
      showError('Failed to delete topic. Please try again.')
    }
    setActiveTopicId(null)
    setActiveNote(null)
    setView('notes')
  }

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return
    try {
      await deleteNote(id)
    } catch (err) {
      showError('Failed to delete note. Please try again.')
    }
    if (activeNote?.id === id) setActiveNote(null)
  }

  const handleDeleteDiagram = async (id) => {
    if (!window.confirm('Delete this diagram and its labels?')) return
    try {
      await deleteDiagram(id)
    } catch (err) {
      showError('Failed to delete diagram. Please try again.')
    }
  }

  const renderContent = () => {
    if (quizDiagram) return (
      <QuizMode
        diagram={quizDiagram}
        labels={quizLabels}
        onBack={() => { setQuizDiagram(null); setQuizLabels([]) }}
        onRedoSetup={async () => {
          if (!window.confirm('This will delete all saved labels. Are you sure?')) return
          try {
            await deleteLabels(quizDiagram.id)
            setActiveDiagram(quizDiagram)
            setQuizDiagram(null)
            setQuizLabels([])
          } catch {
            showError('Failed to clear labels. Please try again.')
          }
        }}
      />
    )
    if (activeNote) return (
      <NoteEditor
        note={activeNote}
        onSave={async (c) => {
          try {
            await updateNoteContent(activeNote.id, c)
          } catch {
            showError('Failed to save note. Your changes may not be saved.')
          }
        }}
        onBack={() => setActiveNote(null)}
        onRename={async (newTitle) => {
          try {
            await renameNote(activeNote.id, newTitle)
            setActiveNote((prev) => ({ ...prev, title: newTitle }))
          } catch {
            showError('Failed to rename note. Please try again.')
          }
        }}
      />
    )
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
    <>
      <AppShell classes={classes} activeClassId={activeClassId} onSelectClass={handleSelectClass} onAddClass={handleAddClass} onDeleteClass={handleDeleteClass}
        topics={topics} activeTopicId={activeTopicId} onSelectTopic={handleSelectTopic} onAddTopic={handleAddTopic} onDeleteTopic={handleDeleteTopic}>
        {renderContent()}
      </AppShell>
      {toast && <Toast message={toast} onDismiss={dismiss} />}
      {modal && (
        <InputModal
          title={modal.title}
          placeholder={modal.placeholder}
          onConfirm={modal.onConfirm}
          onCancel={closeModal}
        />
      )}
    </>
  )
}
