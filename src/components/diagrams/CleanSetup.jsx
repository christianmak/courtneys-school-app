import React, { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Image as KonvaImage, Circle, Text } from 'react-konva'
import useImage from 'use-image'
import { useCanvasSize } from '../../hooks/useCanvasSize'
import { computeImageFit, pinToRatios, ratiosToPin } from '../../lib/imageUtils'

export default function CleanSetup({ diagram, onSaveLabels, onDone }) {
  const [image, imageStatus] = useImage(diagram.image_url)
  const [pins, setPins] = useState([])
  const [pendingPin, setPendingPin] = useState(null)
  const [labelText, setLabelText] = useState('')
  const [fit, setFit] = useState({ x: 0, y: 0, width: 700, height: 500 })
  const stageRef = useRef()
  const { containerRef, width, height } = useCanvasSize(700, 7 / 5)

  useEffect(() => {
    if (image) {
      setFit(computeImageFit(image.naturalWidth, image.naturalHeight, width, height))
    }
  }, [image, width, height])

  const handleClick = () => {
    if (pendingPin) return
    setPendingPin(stageRef.current.getPointerPosition())
  }

  const handleConfirm = () => {
    if (!labelText.trim()) return
    const ratios = pinToRatios(pendingPin, fit)
    setPins((prev) => [...prev, { ...ratios, label_text: labelText.trim() }])
    setPendingPin(null); setLabelText('')
  }

  const handleSave = async () => { await onSaveLabels(pins); onDone() }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onDone} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}>← Back</button>
          <div>
            <h3 style={{ fontWeight: '600' }}>{diagram.name} — Label Setup</h3>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>Click any structure to place a label pin.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>{pins.length} pin{pins.length !== 1 ? 's' : ''}</span>
          <button onClick={handleSave} disabled={pins.length === 0} style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', opacity: pins.length === 0 ? 0.5 : 1 }}>
            Save & quiz
          </button>
        </div>
      </div>
      {imageStatus === 'loading' && (
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '8px' }}>Loading image...</p>
      )}
      {imageStatus === 'failed' && (
        <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '8px' }}>⚠ Image failed to load. Check your connection.</p>
      )}
      <div ref={containerRef} style={{ width: '100%' }}>
      <Stage ref={stageRef} width={width} height={height} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'crosshair' }} onClick={handleClick} onTap={handleClick}>
        <Layer>
          {image && <KonvaImage image={image} x={fit.x} y={fit.y} width={fit.width} height={fit.height} />}
          {pins.map((p, i) => {
            const pos = ratiosToPin(p, fit)
            return (
              <React.Fragment key={i}>
                <Circle x={pos.x} y={pos.y} radius={8} fill="#6366f1" stroke="#fff" strokeWidth={2} />
                <Text x={pos.x + 12} y={pos.y - 8} text={p.label_text} fontSize={13} fill="#1e1b4b" fontStyle="bold" />
              </React.Fragment>
            )
          })}
          {pendingPin && <Circle x={pendingPin.x} y={pendingPin.y} radius={8} fill="#ef4444" stroke="#fff" strokeWidth={2} />}
        </Layer>
      </Stage>
      </div>
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
