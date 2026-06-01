export default function DiagramList({ diagrams, onSelect, onAdd, onDelete }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Diagrams</h2>
        <button onClick={onAdd} style={{ padding: '6px 12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ Add diagram</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {diagrams.map((d) => (
          <div key={d.id} onClick={() => onSelect(d)} style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '500' }}>{d.name}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{d.mode === 'labeled' ? 'Labels on image' : 'Clean image'}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🖼</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(d.id) }}
                style={{ padding: '6px 10px', border: 'none', background: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}
                title="Delete diagram"
                aria-label="Delete diagram"
              >🗑</button>
            </div>
          </div>
        ))}
        {diagrams.length === 0 && <p style={{ color: '#9ca3af' }}>No diagrams yet.</p>}
      </div>
    </div>
  )
}
