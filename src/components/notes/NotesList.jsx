export default function NotesList({ notes, onSelect, onAdd, onDelete }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Notes</h2>
        <button aria-label="Add note" onClick={onAdd} style={{ padding: '6px 12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          + Add note
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {notes.map((note) => (
          <div key={note.id} style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
            <div onClick={() => onSelect(note)} style={{ flex: 1, padding: '12px 16px', cursor: 'pointer' }}>
              <div style={{ fontWeight: '500' }}>{note.title}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                {new Date(note.updated_at).toLocaleDateString()}
              </div>
            </div>
            <button
              onClick={() => onDelete(note.id)}
              style={{ padding: '8px 12px', border: 'none', background: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '16px', flexShrink: 0 }}
              title="Delete note"
              aria-label="Delete note"
            >🗑</button>
          </div>
        ))}
        {notes.length === 0 && <p style={{ color: '#9ca3af' }}>No notes yet.</p>}
      </div>
    </div>
  )
}
