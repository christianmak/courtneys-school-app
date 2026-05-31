import React, { useState, useRef } from 'react'
import { Stage, Layer, Image as KonvaImage, Circle, Text } from 'react-konva'
import useImage from 'use-image'

export default function CleanSetup({ diagram, onSaveLabels, onDone }) {
  const [image] = useImage(diagram.image_url, 'anonymous')
  const [pins, setPins] = useState([])
  const [pendingPin, setPendingPin] = useState(null)
  const [labelText, setLabelText] = useState('')
  const stageRef = useRef()

  const handleClick = () => {
    if (pendingPin) return
    setPendingPin(stageRef.current.getPointerPosition())
  }

  const handleConfirm = () => {
    if (!labelText.trim()) return
    setPins((prev) => [...prev, { pin_x: pendingPin.x, pin_y: pendingPin.y, label_text: labelText.trim() }])
    setPendingPin(null); setLabelText('')
  }

  const handleSave = async () => { await onSaveLabels(pins); onDone() }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontWeight: '600' }}>{diagram.name} — Label Setup</h3>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Click any structure to place a label pin.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>{pins.length} pin{pins.length !== 1 ? 's' : ''}</span>
          <button onClick={handleSave} disabled={pins.length === 0} style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', opacity: pins.length === 0 ? 0.5 : 1 }}>
            Save & quiz
          </button>
        </div>
      </div>
      <Stage ref={stageRef} width={700} height={500} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'crosshair' }} onClick={handleClick} onTap={handleClick}>
        <Layer>
          {image && <KonvaImage image={image} width={700} height={500} />}
          {pins.map((p, i) => (
            <React.Fragment key={i}>
              <Circle x={p.pin_x} y={p.pin_y} radius={8} fill="#6366f1" stroke="#fff" strokeWidth={2} />
              <Text x={p.pin_x + 12} y={p.pin_y - 8} text={p.label_text} fontSize={13} fill="#1e1b4b" fontStyle="bold" />
            </React.Fragment>
          ))}
          {pendingPin && <Circle x={pendingPin.x} y={pendingPin.y} radius={8} fill="#ef4444" stroke="#fff" strokeWidth={2} />}
        </Layer>
      </Stage>
      {pendingPin && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <input autoFocus value={labelText} onChange={(e) => setLabelText(e.target.value)} placeholder="Label for this structure" onKeyDown={(e) => e.key === 'Enter' && handleConfirm()} style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
          <button onClick={handleConfirm} style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add</button>
          <button onClick={() => setPendingPin(null)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
        </div>
      )}
    </div>
  )
}
