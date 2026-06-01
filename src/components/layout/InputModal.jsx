import { useEffect, useRef } from 'react'

export default function InputModal({ title, placeholder, onConfirm, onCancel }) {
  const inputRef = useRef()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleConfirm = () => {
    const val = inputRef.current?.value?.trim()
    if (!val) return
    onConfirm(val)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleConfirm()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 500,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '12px', padding: '24px',
          width: '320px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{title}</h3>
        <input
          ref={inputRef}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          style={{
            padding: '10px 12px', border: '1px solid #d1d5db',
            borderRadius: '8px', fontSize: '14px', outline: 'none',
            borderColor: '#6366f1',
          }}
        />
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '14px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
