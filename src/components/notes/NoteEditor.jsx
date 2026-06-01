import { useRef, useState, useCallback, useEffect } from 'react'
import { getStroke } from 'perfect-freehand'
import PenToolbar from './PenToolbar'
import { uploadNoteImage } from '../../hooks/useNotes'

function getSvgPath(stroke) {
  if (!stroke.length) return ''
  return stroke.reduce((acc, [x, y], i, arr) => {
    if (i === 0) return `M ${x},${y}`
    const [cx, cy] = arr[i - 1]
    return `${acc} Q ${cx},${cy} ${(cx + x) / 2},${(cy + y) / 2}`
  }, '') + ' Z'
}

function getStrokeBounds(stroke) {
  const xs = stroke.points.map(([x]) => x)
  const ys = stroke.points.map(([, y]) => y)
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  }
}

function hitTest(bounds, x, y, radius = 20) {
  return x >= bounds.minX - radius &&
         x <= bounds.maxX + radius &&
         y >= bounds.minY - radius &&
         y <= bounds.maxY + radius
}

export default function NoteEditor({ note, onSave, onBack, onRename }) {
  const [strokes, setStrokes] = useState(note?.content?.strokes ?? [])
  const [images, setImages] = useState(note?.content?.images ?? [])
  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState('#000000')
  const [size, setSize] = useState(4)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(note.title)
  const [livePoints, setLivePoints] = useState([])
  const isDrawing = useRef(false)
  const currentPoints = useRef([])
  const saveTimer = useRef(null)
  const svgRef = useRef(null)

  const scheduleSave = useCallback((content) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onSave(content), 800)
  }, [onSave])

  const getPoint = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    const src = e.touches ? e.touches[0] : e
    return [src.clientX - rect.left, src.clientY - rect.top, src.pressure ?? 0.5]
  }

  const handlePointerDown = (e) => {
    if (e.pointerType === 'touch') return
    e.preventDefault()
    isDrawing.current = true
    currentPoints.current = [getPoint(e)]
    setLivePoints([...currentPoints.current])
  }

  const handlePointerMove = (e) => {
    if (!isDrawing.current) return
    if (e.pointerType === 'touch') return
    e.preventDefault()
    const point = getPoint(e)
    currentPoints.current = [...currentPoints.current, point]
    setLivePoints([...currentPoints.current])

    if (tool === 'eraser') {
      const [ex, ey] = point
      setStrokes((prev) => {
        const filtered = prev.filter((s) => !hitTest(getStrokeBounds(s), ex, ey))
        if (filtered.length !== prev.length) {
          scheduleSave({ strokes: filtered, images, version: 2 })
        }
        return filtered
      })
    }
  }

  const handlePointerUp = () => {
    if (!isDrawing.current) return
    isDrawing.current = false
    if (currentPoints.current.length < 2) { setLivePoints([]); return }
    if (tool === 'eraser') {
      // Erasing already happened in handlePointerMove, just clear live points
      setLivePoints([])
      currentPoints.current = []
      return
    }
    const updated = [...strokes, { points: currentPoints.current, color, size }]
    setStrokes(updated)
    setLivePoints([])
    currentPoints.current = []
    scheduleSave({ strokes: updated, images, version: 2 })
  }

  const handleClear = () => {
    setStrokes([])
    setImages([])
    onSave({ strokes: [], images: [], version: 2 })
  }

  const handleInsertImage = useCallback(async (file) => {
    try {
      const url = await uploadNoteImage(note.topic_id, note.id, file)
      const img = new window.Image()
      img.onload = () => {
        const maxW = 400
        const scale = Math.min(1, maxW / img.naturalWidth)
        const w = Math.round(img.naturalWidth * scale)
        const h = Math.round(img.naturalHeight * scale)
        setImages((prev) => {
          const offset = prev.length * 24
          const newImage = { id: Date.now().toString(), url, x: 80 + offset, y: 60 + offset, width: w, height: h }
          const updated = [...prev, newImage]
          scheduleSave({ strokes, images: updated, version: 2 })
          return updated
        })
      }
      img.src = url
    } catch (err) {
      console.error('Failed to upload image', err)
    }
  }, [note.topic_id, note.id, strokes, scheduleSave])

  useEffect(() => {
    const handlePaste = async (e) => {
      const items = Array.from(e.clipboardData?.items ?? [])
      const imageItem = items.find((item) => item.type.startsWith('image/'))
      if (!imageItem) return
      const file = imageItem.getAsFile()
      if (!file) return
      await handleInsertImage(file)
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handleInsertImage])

  const liveStrokeOutline = livePoints.length > 1 && tool === 'pen'
    ? getStroke(livePoints, { size, thinning: 0.5, smoothing: 0.5, streamline: 0.5 })
    : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderBottom: '1px solid #e5e7eb' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>← Back</button>
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => {
              setEditingTitle(false)
              if (titleDraft.trim() && titleDraft.trim() !== note.title) {
                onRename?.(titleDraft.trim())
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.target.blur()
              if (e.key === 'Escape') { setTitleDraft(note.title); setEditingTitle(false) }
            }}
            style={{ fontSize: '15px', fontWeight: '600', border: 'none', borderBottom: '2px solid #6366f1', background: 'transparent', outline: 'none', minWidth: '120px' }}
          />
        ) : (
          <h2
            onClick={() => setEditingTitle(true)}
            style={{ fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
            title="Click to rename"
          >
            {note.title}
          </h2>
        )}
      </div>
      <PenToolbar tool={tool} color={color} size={size} onToolChange={setTool} onColorChange={setColor} onSizeChange={setSize} onClear={handleClear} onInsertImage={handleInsertImage} />
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: '#fafafa' }}>
        <svg ref={svgRef}
          style={{
            display: 'block',
            width: '100%',
            height: '2400px',
            touchAction: 'pan-y',
            cursor: tool === 'eraser' ? 'cell' : 'crosshair'
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Ruled lines */}
          {Array.from({ length: 75 }, (_, i) => (
            <line
              key={i}
              x1="0" y1={i * 32 + 48}
              x2="100%" y2={i * 32 + 48}
              stroke="#e5e7eb" strokeWidth="1"
            />
          ))}
          {/* Left margin line */}
          <line x1="60" y1="0" x2="60" y2="2400" stroke="#fecdd3" strokeWidth="1" />
          {images.map((img) => (
            <image
              key={img.id}
              href={img.url}
              x={img.x}
              y={img.y}
              width={img.width}
              height={img.height}
              style={{ pointerEvents: 'none' }}
            />
          ))}
          {strokes.map((s, i) => {
            const outline = getStroke(s.points, { size: s.size, thinning: 0.5, smoothing: 0.5, streamline: 0.5 })
            return <path key={i} d={getSvgPath(outline)} fill={s.color} />
          })}
          {liveStrokeOutline.length > 0 && <path d={getSvgPath(liveStrokeOutline)} fill={color} opacity="0.85" />}
          {tool === 'eraser' && livePoints.length > 0 && (() => {
            const [lx, ly] = livePoints[livePoints.length - 1]
            return <circle cx={lx} cy={ly} r={20} fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 2" />
          })()}
        </svg>
      </div>
    </div>
  )
}
