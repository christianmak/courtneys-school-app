export default function TopicPanel({ topics, activeId, onSelect, onAdd, onDelete }) {
  return (
    <div style={{ width: '200px', borderRight: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {topics.map((t) => (
          <button key={t.id} onClick={() => onSelect(t.id)} style={{
            display: activeId === t.id ? 'flex' : 'block', alignItems: 'center', width: '100%', textAlign: 'left',
            padding: '8px 12px', border: 'none', borderRadius: '6px',
            background: activeId === t.id ? '#e0e7ff' : 'none',
            cursor: 'pointer', marginBottom: '2px',
            fontWeight: activeId === t.id ? '600' : '400',
          }}>
            {t.name}
            {activeId === t.id && (
              <span
                onClick={(e) => { e.stopPropagation(); onDelete(t.id) }}
                style={{ marginLeft: 'auto', color: '#9ca3af', cursor: 'pointer', fontSize: '12px', paddingLeft: '6px' }}
                title="Delete topic"
              >×</span>
            )}
          </button>
        ))}
      </div>
      <div style={{ padding: '8px', borderTop: '1px solid #e5e7eb' }}>
        <button aria-label="Add topic" onClick={onAdd} style={{ width: '100%', padding: '8px', border: '1px dashed #d1d5db', borderRadius: '6px', background: 'none', cursor: 'pointer', color: '#6b7280' }}>
          + Add topic
        </button>
      </div>
    </div>
  )
}
