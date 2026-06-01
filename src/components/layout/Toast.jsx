import { useEffect } from 'react'

export default function Toast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000,
      background: '#1f2937', color: '#fff', padding: '12px 16px',
      borderRadius: '8px', maxWidth: '320px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px',
      animation: 'slideIn 0.2s ease',
    }}>
      <span style={{ color: '#ef4444', fontSize: '16px', flexShrink: 0 }}>⚠</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0, fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>×</button>
    </div>
  )
}
