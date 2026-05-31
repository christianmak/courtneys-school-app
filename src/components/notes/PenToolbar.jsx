const COLORS = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6']
const SIZES = [2, 4, 8, 14]

export default function PenToolbar({ tool, color, size, onToolChange, onColorChange, onSizeChange, onClear }) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
      <button aria-label="Pen" onClick={() => onToolChange('pen')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', background: tool === 'pen' ? '#6366f1' : '#fff', color: tool === 'pen' ? '#fff' : '#374151', cursor: 'pointer' }}>
        ✏️ Pen
      </button>
      <button aria-label="Eraser" onClick={() => onToolChange('eraser')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', background: tool === 'eraser' ? '#6366f1' : '#fff', color: tool === 'eraser' ? '#fff' : '#374151', cursor: 'pointer' }}>
        🧹 Eraser
      </button>
      <div style={{ display: 'flex', gap: '4px' }}>
        {COLORS.map((c) => (
          <button key={c} aria-label={`Color ${c}`} onClick={() => onColorChange(c)} style={{ width: '22px', height: '22px', borderRadius: '50%', background: c, border: color === c ? '2px solid #374151' : '2px solid transparent', cursor: 'pointer', padding: 0 }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {SIZES.map((s) => (
          <button key={s} aria-label={`Size ${s}`} onClick={() => onSizeChange(s)} style={{ width: `${s + 12}px`, height: `${s + 12}px`, borderRadius: '50%', background: '#374151', border: size === s ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer', padding: 0 }} />
        ))}
      </div>
      <button aria-label="Clear" onClick={onClear} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #fca5a5', color: '#ef4444', background: '#fff', cursor: 'pointer', marginLeft: 'auto' }}>
        🗑 Clear
      </button>
    </div>
  )
}
