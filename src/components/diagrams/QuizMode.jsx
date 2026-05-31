import React, { useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Rect, Circle, Text } from 'react-konva'
import useImage from 'use-image'

function normalize(str) {
  return str.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

export default function QuizMode({ diagram, labels, onBack }) {
  const [image] = useImage(diagram.image_url, 'anonymous')
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const setAnswer = (id, val) => setAnswers((prev) => ({ ...prev, [id]: val }))

  const correctIds = submitted
    ? new Set(labels.filter((l) => normalize(answers[l.id] ?? '') === normalize(l.label_text)).map((l) => l.id))
    : new Set()
  const correctCount = submitted ? correctIds.size : null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontWeight: '600' }}>{diagram.name} — Quiz</h3>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>
            {diagram.mode === 'labeled' ? 'Type what each covered label says.' : 'Type what each numbered pin represents.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {submitted && <span style={{ fontWeight: '600', color: correctCount === labels.length ? '#22c55e' : '#ef4444' }}>Score: {correctCount}/{labels.length}</span>}
          <button aria-label="Back" onClick={onBack} style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', background: '#fff' }}>← Back</button>
          {!submitted
            ? <button aria-label="Submit" onClick={() => setSubmitted(true)} style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Submit</button>
            : <button onClick={() => { setAnswers({}); setSubmitted(false) }} style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Retry</button>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <Stage width={560} height={420} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', flexShrink: 0 }}>
          <Layer>
            {image && <KonvaImage image={image} width={560} height={420} />}
            {diagram.mode === 'labeled' && labels.map((l) => {
              const correct = correctIds.has(l.id)
              return (
                <Rect
                  key={l.id}
                  x={l.x}
                  y={l.y}
                  width={l.width}
                  height={l.height}
                  fill={!submitted ? '#374151' : correct ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)'}
                  stroke={!submitted ? '#1f2937' : correct ? '#16a34a' : '#dc2626'}
                  strokeWidth={1}
                />
              )
            })}
            {diagram.mode === 'clean' && labels.map((l, i) => (
              <React.Fragment key={l.id}>
                <Circle x={l.pin_x} y={l.pin_y} radius={10} fill="#6366f1" stroke="#fff" strokeWidth={2} />
                <Text x={l.pin_x - 4} y={l.pin_y - 6} text={String(i + 1)} fontSize={11} fill="#fff" fontStyle="bold" />
              </React.Fragment>
            ))}
          </Layer>
        </Stage>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '420px' }}>
          {labels.map((l, i) => {
            const correct = correctIds.has(l.id)
            return (
              <div key={l.id}>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '3px' }}>
                  {diagram.mode === 'clean' ? `Pin ${i + 1}` : `Label ${i + 1}`}
                </label>
                <input
                  value={answers[l.id] ?? ''}
                  onChange={(e) => setAnswer(l.id, e.target.value)}
                  disabled={submitted}
                  placeholder="Your answer..."
                  style={{ width: '100%', padding: '7px 10px', border: `1px solid ${!submitted ? '#d1d5db' : correct ? '#86efac' : '#fca5a5'}`, borderRadius: '6px', background: !submitted ? '#fff' : correct ? '#f0fdf4' : '#fef2f2' }}
                />
                {submitted && !correct && <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>✗ {l.label_text}</div>}
                {submitted && correct && <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '2px' }}>✓ Correct</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
