import { useRef, useState, useCallback } from 'react'
import { getStroke } from 'perfect-freehand'
import PenToolbar from './PenToolbar'

function getSvgPath(stroke) {
  if (!stroke.length) return ''
  return stroke.reduce((acc, [x, y], i, arr) => {
    if (i === 0) return `M ${x},${y}`
    const [cx, cy] = arr[i - 1]
    return `${acc} Q ${cx},${cy} ${(cx + x) / 2},${(cy + y) / 2}`
  }, '') + ' Z'
}

export default function NoteEditor({ note, onSave, onBack }) {
  const [strokes, setStrokes] = useState(note?.content?.strokes ?? [])
  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState('#000000')
  const [size, setSize] = useState(4)
  const [livePoints, setLivePoints] = useState([])
  const isDrawing = useRef(false)
  const currentPoints = useRef([])
  const saveTimer = useRef(null)
  const svgRef = useRef(null)

  const scheduleSave = useCallback((updatedStrokes) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onSave({ strokes: updatedStrokes, version: 1 }), 800)
  }, [onSave])

  const getPoint = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    const src = e.touches ? e.touches[0] : e
    return [src.clientX - rect.left, src.clientY - rect.top, src.pressure ?? 0.5]
  }

  const handlePointerDown = (e) => {
    e.preventDefault()
    isDrawing.current = true
    currentPoints.current = [getPoint(e)]
    setLivePoints([...currentPoints.current])
  }

  const handlePointerMove = (e) => {
    if (!isDrawing.current) return
    e.preventDefault()
    currentPoints.current = [...currentPoints.current, getPoint(e)]
    setLivePoints([...currentPoints.current])
  }

  const handlePointerUp = () => {
    if (!isDrawing.current) return
    isDrawing.current = false
    if (currentPoints.current.length < 2) { setLivePoints([]); return }
    let updated
    if (tool === 'eraser') {
      updated = strokes.slice(0, -1)
    } else {
      updated = [...strokes, { points: currentPoints.current, color, size }]
    }
    setStrokes(updated)
    setLivePoints([])
    currentPoints.current = []
    scheduleSave(updated)
  }

  const handleClear = () => {
    setStrokes([])
    onSave({ strokes: [], version: 1 })
  }

  const liveStrokeOutline = livePoints.length > 1 && tool === 'pen'
    ? getStroke(livePoints, { size, thinning: 0.5, smoothing: 0.5, streamline: 0.5 })
    : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderBottom: '1px solid #e5e7eb' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>← Back</button>
        <h2 style={{ fontSize: '15px', fontWeight: '600' }}>{note.title}</h2>
      </div>
      <PenToolbar tool={tool} color={color} size={size} onToolChange={setTool} onColorChange={setColor} onSizeChange={setSize} onClear={handleClear} />
      <svg ref={svgRef} style={{ flex: 1, touchAction: 'none', background: '#fafafa', cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
        {strokes.map((s, i) => {
          const outline = getStroke(s.points, { size: s.size, thinning: 0.5, smoothing: 0.5, streamline: 0.5 })
          return <path key={i} d={getSvgPath(outline)} fill={s.color} />
        })}
        {liveStrokeOutline.length > 0 && <path d={getSvgPath(liveStrokeOutline)} fill={color} opacity="0.85" />}
      </svg>
    </div>
  )
}
