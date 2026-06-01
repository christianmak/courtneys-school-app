export default function ClassTabs({ classes, activeId, onSelect, onAdd, onDelete }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#fff', flexShrink: 0 }}>
      {classes.map((c) => (
        <button key={c.id} onClick={() => onSelect(c.id)} style={{
          padding: '10px 20px', border: 'none',
          borderBottom: activeId === c.id ? `2px solid ${c.color}` : '2px solid transparent',
          background: 'none', cursor: 'pointer',
          fontWeight: activeId === c.id ? '600' : '400',
          color: activeId === c.id ? c.color : '#374151',
        }}>
          {c.name}
          {activeId === c.id && (
            <span
              onClick={(e) => { e.stopPropagation(); onDelete(c.id) }}
              style={{ marginLeft: '6px', color: '#9ca3af', cursor: 'pointer', fontSize: '12px', lineHeight: 1 }}
              title="Delete class"
            >×</span>
          )}
        </button>
      ))}
      <button aria-label="Add class" onClick={onAdd} style={{ padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '18px' }}>
        +
      </button>
    </div>
  )
}
