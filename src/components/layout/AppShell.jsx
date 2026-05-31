import ClassTabs from './ClassTabs'
import TopicPanel from './TopicPanel'

export default function AppShell({ classes, activeClassId, onSelectClass, onAddClass, topics, activeTopicId, onSelectTopic, onAddTopic, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <ClassTabs classes={classes} activeId={activeClassId} onSelect={onSelectClass} onAdd={onAddClass} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <TopicPanel topics={topics} activeId={activeTopicId} onSelect={onSelectTopic} onAdd={onAddTopic} />
        <main style={{ flex: 1, overflow: 'auto', padding: '16px' }}>{children}</main>
      </div>
    </div>
  )
}
