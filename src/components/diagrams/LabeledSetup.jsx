import { useState, useRef } from 'react'
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva'
import useImage from 'use-image'

export default function LabeledSetup({ diagram, onSaveLabels, onDone }) {
  const [image] = useImage(diagram.image_url, 'anonymous')
  const [labels, setLabels] = useState([])
  const [drawing, setDrawing] = useState(false)
  const [startPos, setStartPos] = useState(null)
  const [currentRect, setCurrentRect] = useState(null)
  const [pendingRect, setPendingRect] = useState(null)
  const [labelText, setLabelText] = useState('')
  const stageRef = useRef()

  const getPos = () => stageRef.current.getPointerPosition()

  const handleMouseDown = () => {
    if (pendingRect) return
    const pos = getPos()
    setStartPos(pos); setDrawing(true)
    setCurrentRect({ x: pos.x, y: pos.y, width: 0, height: 0 })
  }

  const handleMouseMove = () => {
    if (!drawing) return
    const pos = getPos()
    setCurrentRect({ x: Math.min(startPos.x, pos.x), y: Math.min(startPos.y, pos.y), width: Math.abs(pos.x - startPos.x), height: Math.abs(pos.y - startPos.y) })
  }

  const handleMouseUp = () => {
    if (!drawing) return
    setDrawing(false)
    if (!currentRect || currentRect.width < 10 || currentRect.height < 10) { setCurrentRect(null); return }
    setPendingRect(currentRect); setCurrentRect(null)
  }

  const handleConfirm = () => {
    if (!labelText.trim()) return
    setLabels((prev) => [...prev, { x: pendingRect.x, y: pendingRect.y, width: pendingRect.width, height: pendingRect.height, label_text: labelText.trim() }])
    setPendingRect(null); setLabelText('')
  }

  const handleSave = async () => { await onSaveLabels(labels); onDone() }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontWeight: '600' }}>{diagram.name} — Label Setup</h3>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Draw a rectangle over each printed label, then type what it says.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>{labels.length} label{labels.length !== 1 ? 's' : ''}</span>
          <button onClick={handleSave} disabled={labels.length === 0} style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', opacity: labels.length === 0 ? 0.5 : 1 }}>
            Save & quiz
          </button>
        </div>
      </div>
      <Stage ref={stageRef} width={700} height={500} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'crosshair' }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}>
        <Layer>
          {image && <KonvaImage image={image} width={700} height={500} />}
          {labels.map((l, i) => <Rect key={i} x={l.x} y={l.y} width={l.width} height={l.height} fill="rgba(99,102,241,0.3)" stroke="#6366f1" strokeWidth={1} />)}
          {currentRect && <Rect x={currentRect.x} y={currentRect.y} width={currentRect.width} height={currentRect.height} fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth={1} dash={[4, 4]} />}
          {pendingRect && <Rect x={pendingRect.x} y={pendingRect.y} width={pendingRect.width} height={pendingRect.height} fill="rgba(239,68,68,0.25)" stroke="#ef4444" strokeWidth={2} />}
        </Layer>
      </Stage>
      {pendingRect && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <input autoFocus value={labelText} onChange={(e) => setLabelText(e.target.value)} placeholder="What does this label say?" onKeyDown={(e) => e.key === 'Enter' && handleConfirm()} style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
          <button onClick={handleConfirm} style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add</button>
          <button onClick={() => setPendingRect(null)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
        </div>
      )}
    </div>
  )
}
