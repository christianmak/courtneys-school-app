import { useRef, useState } from 'react'

export default function DiagramSetup({ onUpload }) {
  const [mode, setMode] = useState(null)
  const [name, setName] = useState('')
  const [file, setFile] = useState(null)
  const fileRef = useRef()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name || !file || !mode) return
    onUpload(name, file, mode)
  }

  return (
    <div style={{ maxWidth: '480px' }}>
      <h3 style={{ marginBottom: '16px', fontWeight: '600' }}>Add Diagram</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>Diagram name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cell Overview" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>Type</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[['labeled', 'Labels on image', 'Textbook diagram — draw boxes over printed labels'], ['clean', 'Clean image', 'No labels — click to place your own pins']].map(([val, title, desc]) => (
              <button key={val} type="button" onClick={() => setMode(val)} style={{ flex: 1, padding: '10px', border: `2px solid ${mode === val ? '#6366f1' : '#e5e7eb'}`, borderRadius: '8px', background: mode === val ? '#eef2ff' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>Image</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <button type="submit" disabled={!name || !file || !mode} style={{ padding: '10px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: (!name || !file || !mode) ? 0.5 : 1 }}>
          Upload & set up labels
        </button>
      </form>
    </div>
  )
}
