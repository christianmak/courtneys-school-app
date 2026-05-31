import AppShell from './components/layout/AppShell'

export default function App() {
  return (
    <AppShell classes={[]} activeClassId={null} onSelectClass={() => {}} onAddClass={() => {}}
      topics={[]} activeTopicId={null} onSelectTopic={() => {}} onAddTopic={() => {}}>
      <p style={{ color: '#9ca3af' }}>Select a class and topic to get started.</p>
    </AppShell>
  )
}
