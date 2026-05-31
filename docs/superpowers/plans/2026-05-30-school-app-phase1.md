# School App Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based study app with handwritten note-taking (Class → Topic → Notes) and a diagram labeling quiz with two setup modes, backed by Supabase.

**Architecture:** React SPA with top-tabs (classes) + left-sidebar (topics) + content-area layout. Supabase provides database and image storage. No login — credentials hardcoded via env vars. Notes store Apple Pencil strokes as JSON. Diagram labels store canvas coordinates for quiz coverage.

**Tech Stack:** React 18, Vite, @supabase/supabase-js v2, perfect-freehand, konva, react-konva, use-image, Vitest, @testing-library/react

---

## File Map

```
C:\Projects\SchoolApp\
├── .env
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── hooks/
│   │   ├── useClasses.js
│   │   ├── useTopics.js
│   │   ├── useNotes.js
│   │   └── useDiagrams.js
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.jsx
│   │   │   ├── ClassTabs.jsx
│   │   │   └── TopicPanel.jsx
│   │   ├── notes/
│   │   │   ├── NotesList.jsx
│   │   │   ├── NoteEditor.jsx
│   │   │   └── PenToolbar.jsx
│   │   └── diagrams/
│   │       ├── DiagramList.jsx
│   │       ├── DiagramSetup.jsx
│   │       ├── LabeledSetup.jsx
│   │       ├── CleanSetup.jsx
│   │       └── QuizMode.jsx
│   ├── styles/
│   │   └── index.css
│   └── test/
│       ├── setup.js
│       ├── mocks/
│       │   └── supabase.js
│       ├── hooks/
│       │   ├── useClasses.test.js
│       │   ├── useTopics.test.js
│       │   ├── useNotes.test.js
│       │   └── useDiagrams.test.js
│       └── components/
│           ├── ClassTabs.test.jsx
│           ├── TopicPanel.test.jsx
│           ├── NotesList.test.jsx
│           ├── PenToolbar.test.jsx
│           └── QuizMode.test.jsx
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/styles/index.css`, `.env`, `src/test/setup.js`

- [ ] **Step 1: Scaffold Vite + React project**

```bash
cd C:\Projects\SchoolApp
npm create vite@latest . -- --template react
```
Expected: Vite project files created in current directory.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js perfect-freehand konva react-konva use-image
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: Configure Vitest in vite.config.js**

Replace `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
  },
})
```

- [ ] **Step 4: Create test setup file**

Create `src/test/setup.js`:

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to package.json**

In `package.json` scripts, add:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 6: Create .env placeholder**

Create `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] **Step 7: Verify scaffold**

```bash
npm run dev
```
Expected: Vite dev server starts at http://localhost:5173.

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Vite React project with dependencies"
```

---

### Task 2: Supabase Setup

**Files:**
- Create: `src/lib/supabase.js`, `src/test/mocks/supabase.js`
- Manual: Supabase dashboard

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com → New project. Wait ~2 min for provisioning.

- [ ] **Step 2: Run schema SQL in Supabase SQL Editor**

```sql
create table classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#6366f1'
);

create table topics (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  name text not null
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade,
  title text not null,
  content jsonb not null default '{"strokes":[],"version":1}',
  updated_at timestamptz not null default now()
);

create table diagrams (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade,
  name text not null,
  image_url text not null,
  mode text not null check (mode in ('labeled', 'clean'))
);

create table diagram_labels (
  id uuid primary key default gen_random_uuid(),
  diagram_id uuid references diagrams(id) on delete cascade,
  label_text text not null,
  x float, y float, width float, height float,
  pin_x float, pin_y float
);

alter table classes disable row level security;
alter table topics disable row level security;
alter table notes disable row level security;
alter table diagrams disable row level security;
alter table diagram_labels disable row level security;
```

Expected: All tables created with no errors.

- [ ] **Step 3: Create storage bucket**

Supabase dashboard → Storage → New bucket → Name: `diagrams` → Public: true.

- [ ] **Step 4: Copy credentials into .env**

Supabase dashboard → Settings → API. Copy Project URL and anon key into `.env`.

- [ ] **Step 5: Create Supabase client**

Create `src/lib/supabase.js`:

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

- [ ] **Step 6: Create Supabase mock**

Create `src/test/mocks/supabase.js`:

```js
export const supabase = {
  from: vi.fn(() => supabase),
  select: vi.fn(() => supabase),
  insert: vi.fn(() => supabase),
  update: vi.fn(() => supabase),
  delete: vi.fn(() => supabase),
  eq: vi.fn(() => supabase),
  order: vi.fn(() => supabase),
  single: vi.fn(() => supabase),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/img.jpg' } })),
    })),
  },
}

vi.mock('../../lib/supabase', () => ({ supabase }))
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add Supabase client, schema, and test mock"
```

---

### Task 3: App Shell Layout

**Files:**
- Create: `src/components/layout/AppShell.jsx`, `src/components/layout/ClassTabs.jsx`, `src/components/layout/TopicPanel.jsx`, `src/test/components/ClassTabs.test.jsx`, `src/test/components/TopicPanel.test.jsx`
- Modify: `src/App.jsx`, `src/styles/index.css`, `src/main.jsx`

- [ ] **Step 1: Write failing test for ClassTabs**

Create `src/test/components/ClassTabs.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import ClassTabs from '../../components/layout/ClassTabs'

const classes = [
  { id: '1', name: 'Biology 101', color: '#6366f1' },
  { id: '2', name: 'Anatomy', color: '#ec4899' },
]

test('renders a tab for each class', () => {
  render(<ClassTabs classes={classes} activeId="1" onSelect={() => {}} onAdd={() => {}} />)
  expect(screen.getByText('Biology 101')).toBeInTheDocument()
  expect(screen.getByText('Anatomy')).toBeInTheDocument()
})

test('calls onSelect with class id when tab clicked', () => {
  const onSelect = vi.fn()
  render(<ClassTabs classes={classes} activeId="1" onSelect={onSelect} onAdd={() => {}} />)
  fireEvent.click(screen.getByText('Anatomy'))
  expect(onSelect).toHaveBeenCalledWith('2')
})

test('calls onAdd when + button clicked', () => {
  const onAdd = vi.fn()
  render(<ClassTabs classes={classes} activeId="1" onSelect={() => {}} onAdd={onAdd} />)
  fireEvent.click(screen.getByRole('button', { name: '+' }))
  expect(onAdd).toHaveBeenCalled()
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- src/test/components/ClassTabs.test.jsx
```
Expected: FAIL — `ClassTabs` not found.

- [ ] **Step 3: Implement ClassTabs**

Create `src/components/layout/ClassTabs.jsx`:

```jsx
export default function ClassTabs({ classes, activeId, onSelect, onAdd }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#fff', flexShrink: 0 }}>
      {classes.map((c) => (
        <button key={c.id} onClick={() => onSelect(c.id)} style={{
          padding: '10px 20px', border: 'none',
          borderBottom: activeId === c.id ? `2px solid ${c.color}` : '2px solid transparent',
          background: 'none', cursor: 'pointer',
          fontWeight: activeId === c.id ? '600' : '400',
          color: activeId === c.id ? c.color : '#374151',
        }}>
          {c.name}
        </button>
      ))}
      <button aria-label="+" onClick={onAdd} style={{ padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '18px' }}>
        +
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- src/test/components/ClassTabs.test.jsx
```
Expected: PASS (3 tests).

- [ ] **Step 5: Write failing test for TopicPanel**

Create `src/test/components/TopicPanel.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import TopicPanel from '../../components/layout/TopicPanel'

const topics = [{ id: 't1', name: 'Cell Biology' }, { id: 't2', name: 'Genetics' }]

test('renders all topics', () => {
  render(<TopicPanel topics={topics} activeId="t1" onSelect={() => {}} onAdd={() => {}} />)
  expect(screen.getByText('Cell Biology')).toBeInTheDocument()
  expect(screen.getByText('Genetics')).toBeInTheDocument()
})

test('calls onSelect with topic id when clicked', () => {
  const onSelect = vi.fn()
  render(<TopicPanel topics={topics} activeId="t1" onSelect={onSelect} onAdd={() => {}} />)
  fireEvent.click(screen.getByText('Genetics'))
  expect(onSelect).toHaveBeenCalledWith('t2')
})

test('calls onAdd when add topic button clicked', () => {
  const onAdd = vi.fn()
  render(<TopicPanel topics={topics} activeId="t1" onSelect={() => {}} onAdd={onAdd} />)
  fireEvent.click(screen.getByRole('button', { name: /add topic/i }))
  expect(onAdd).toHaveBeenCalled()
})
```

- [ ] **Step 6: Run test to verify it fails**

```bash
npm run test:run -- src/test/components/TopicPanel.test.jsx
```
Expected: FAIL — `TopicPanel` not found.

- [ ] **Step 7: Implement TopicPanel**

Create `src/components/layout/TopicPanel.jsx`:

```jsx
export default function TopicPanel({ topics, activeId, onSelect, onAdd }) {
  return (
    <div style={{ width: '200px', borderRight: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {topics.map((t) => (
          <button key={t.id} onClick={() => onSelect(t.id)} style={{
            display: 'block', width: '100%', textAlign: 'left',
            padding: '8px 12px', border: 'none', borderRadius: '6px',
            background: activeId === t.id ? '#e0e7ff' : 'none',
            cursor: 'pointer', marginBottom: '2px',
            fontWeight: activeId === t.id ? '600' : '400',
          }}>
            {t.name}
          </button>
        ))}
      </div>
      <div style={{ padding: '8px', borderTop: '1px solid #e5e7eb' }}>
        <button aria-label="Add topic" onClick={onAdd} style={{ width: '100%', padding: '8px', border: '1px dashed #d1d5db', borderRadius: '6px', background: 'none', cursor: 'pointer', color: '#6b7280' }}>
          + Add topic
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Run test to verify it passes**

```bash
npm run test:run -- src/test/components/TopicPanel.test.jsx
```
Expected: PASS (3 tests).

- [ ] **Step 9: Implement AppShell**

Create `src/components/layout/AppShell.jsx`:

```jsx
import ClassTabs from './ClassTabs'
import TopicPanel from './TopicPanel'

export default function AppShell({ classes, activeClassId, onSelectClass, onAddClass, topics, activeTopicId, onSelectTopic, onAddTopic, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <ClassTabs classes={classes} activeId={activeClassId} onSelect={onSelectClass} onAdd={onAddClass} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <TopicPanel topics={topics} activeId={activeTopicId} onSelect={onSelectTopic} onAdd={onAddTopic} />
        <main style={{ flex: 1, overflow: 'auto', padding: '16px' }}>{children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 10: Update main.jsx and index.css**

Replace `src/main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
```

Replace `src/styles/index.css`:

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; font-size: 14px; color: #111827; }
button { font-family: inherit; font-size: inherit; }
```

Replace `src/App.jsx`:

```jsx
import { useState } from 'react'
import AppShell from './components/layout/AppShell'

export default function App() {
  return (
    <AppShell classes={[]} activeClassId={null} onSelectClass={() => {}} onAddClass={() => {}}
      topics={[]} activeTopicId={null} onSelectTopic={() => {}} onAddTopic={() => {}}>
      <p style={{ color: '#9ca3af' }}>Select a class and topic to get started.</p>
    </AppShell>
  )
}
```

- [ ] **Step 11: Verify in browser**

```bash
npm run dev
```
Expected: App shell renders — empty tab bar at top, empty sidebar, placeholder text in content.

- [ ] **Step 12: Commit**

```bash
git add .
git commit -m "feat: add app shell layout with ClassTabs and TopicPanel"
```

---

### Task 4: Classes CRUD

**Files:**
- Create: `src/hooks/useClasses.js`, `src/test/hooks/useClasses.test.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/test/hooks/useClasses.test.js`:

```js
import { renderHook, act, waitFor } from '@testing-library/react'
import '../mocks/supabase'
import { supabase } from '../mocks/supabase'
import { useClasses } from '../../hooks/useClasses'

beforeEach(() => vi.clearAllMocks())

test('loads classes on mount', async () => {
  supabase.order.mockResolvedValueOnce({ data: [{ id: '1', name: 'Biology', color: '#6366f1' }], error: null })
  const { result } = renderHook(() => useClasses())
  await waitFor(() => expect(result.current.classes).toHaveLength(1))
})

test('addClass inserts and refetches', async () => {
  supabase.order.mockResolvedValue({ data: [], error: null })
  supabase.single.mockResolvedValueOnce({ data: { id: '2', name: 'Anatomy' }, error: null })
  const { result } = renderHook(() => useClasses())
  await act(async () => { await result.current.addClass('Anatomy', '#ec4899') })
  expect(supabase.insert).toHaveBeenCalled()
})

test('deleteClass deletes by id and refetches', async () => {
  supabase.order.mockResolvedValue({ data: [], error: null })
  supabase.eq.mockResolvedValueOnce({ error: null })
  const { result } = renderHook(() => useClasses())
  await act(async () => { await result.current.deleteClass('1') })
  expect(supabase.delete).toHaveBeenCalled()
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm run test:run -- src/test/hooks/useClasses.test.js
```
Expected: FAIL — `useClasses` not found.

- [ ] **Step 3: Implement useClasses**

Create `src/hooks/useClasses.js`:

```js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useClasses() {
  const [classes, setClasses] = useState([])

  const fetchClasses = useCallback(async () => {
    const { data } = await supabase.from('classes').select('*').order('name')
    if (data) setClasses(data)
  }, [])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  const addClass = async (name, color = '#6366f1') => {
    await supabase.from('classes').insert({ name, color }).single()
    await fetchClasses()
  }

  const deleteClass = async (id) => {
    await supabase.from('classes').delete().eq('id', id)
    await fetchClasses()
  }

  return { classes, addClass, deleteClass }
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm run test:run -- src/test/hooks/useClasses.test.js
```
Expected: PASS (3 tests).

- [ ] **Step 5: Wire into App.jsx**

Replace `src/App.jsx`:

```jsx
import { useState } from 'react'
import AppShell from './components/layout/AppShell'
import { useClasses } from './hooks/useClasses'

export default function App() {
  const { classes, addClass } = useClasses()
  const [activeClassId, setActiveClassId] = useState(null)

  const handleAddClass = async () => {
    const name = prompt('Class name:'); if (!name) return; await addClass(name)
  }

  return (
    <AppShell classes={classes} activeClassId={activeClassId} onSelectClass={setActiveClassId} onAddClass={handleAddClass}
      topics={[]} activeTopicId={null} onSelectTopic={() => {}} onAddTopic={() => {}}>
      <p style={{ color: '#9ca3af' }}>Select a class and topic to get started.</p>
    </AppShell>
  )
}
```

- [ ] **Step 6: Verify in browser — click + to add a class, it appears as a tab**

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add useClasses hook with CRUD"
```

---

### Task 5: Topics CRUD

**Files:**
- Create: `src/hooks/useTopics.js`, `src/test/hooks/useTopics.test.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/test/hooks/useTopics.test.js`:

```js
import { renderHook, act, waitFor } from '@testing-library/react'
import '../mocks/supabase'
import { supabase } from '../mocks/supabase'
import { useTopics } from '../../hooks/useTopics'

beforeEach(() => vi.clearAllMocks())

test('loads topics for a class', async () => {
  supabase.order.mockResolvedValueOnce({ data: [{ id: 't1', class_id: 'c1', name: 'Cell Biology' }], error: null })
  const { result } = renderHook(() => useTopics('c1'))
  await waitFor(() => expect(result.current.topics).toHaveLength(1))
})

test('returns empty array when classId is null', async () => {
  const { result } = renderHook(() => useTopics(null))
  await waitFor(() => expect(result.current.topics).toEqual([]))
})

test('addTopic inserts and refetches', async () => {
  supabase.order.mockResolvedValue({ data: [], error: null })
  supabase.single.mockResolvedValueOnce({ data: { id: 't2', name: 'Genetics' }, error: null })
  const { result } = renderHook(() => useTopics('c1'))
  await act(async () => { await result.current.addTopic('Genetics') })
  expect(supabase.insert).toHaveBeenCalled()
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm run test:run -- src/test/hooks/useTopics.test.js
```
Expected: FAIL.

- [ ] **Step 3: Implement useTopics**

Create `src/hooks/useTopics.js`:

```js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTopics(classId) {
  const [topics, setTopics] = useState([])

  const fetchTopics = useCallback(async () => {
    if (!classId) { setTopics([]); return }
    const { data } = await supabase.from('topics').select('*').eq('class_id', classId).order('name')
    if (data) setTopics(data)
  }, [classId])

  useEffect(() => { fetchTopics() }, [fetchTopics])

  const addTopic = async (name) => {
    await supabase.from('topics').insert({ class_id: classId, name }).single()
    await fetchTopics()
  }

  const deleteTopic = async (id) => {
    await supabase.from('topics').delete().eq('id', id)
    await fetchTopics()
  }

  return { topics, addTopic, deleteTopic }
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm run test:run -- src/test/hooks/useTopics.test.js
```
Expected: PASS (3 tests).

- [ ] **Step 5: Wire into App.jsx**

Replace `src/App.jsx`:

```jsx
import { useState } from 'react'
import AppShell from './components/layout/AppShell'
import { useClasses } from './hooks/useClasses'
import { useTopics } from './hooks/useTopics'

export default function App() {
  const { classes, addClass } = useClasses()
  const [activeClassId, setActiveClassId] = useState(null)
  const { topics, addTopic } = useTopics(activeClassId)
  const [activeTopicId, setActiveTopicId] = useState(null)

  const handleAddClass = async () => { const name = prompt('Class name:'); if (!name) return; await addClass(name) }
  const handleAddTopic = async () => { const name = prompt('Topic name:'); if (!name) return; await addTopic(name) }
  const handleSelectClass = (id) => { setActiveClassId(id); setActiveTopicId(null) }

  return (
    <AppShell classes={classes} activeClassId={activeClassId} onSelectClass={handleSelectClass} onAddClass={handleAddClass}
      topics={topics} activeTopicId={activeTopicId} onSelectTopic={setActiveTopicId} onAddTopic={handleAddTopic}>
      <p style={{ color: '#9ca3af' }}>Select a topic to get started.</p>
    </AppShell>
  )
}
```

- [ ] **Step 6: Verify in browser — selecting a class shows topics in sidebar**

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add useTopics hook, wire class/topic navigation"
```

---

### Task 6: Notes List

**Files:**
- Create: `src/hooks/useNotes.js`, `src/components/notes/NotesList.jsx`, `src/test/hooks/useNotes.test.js`, `src/test/components/NotesList.test.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Write failing tests for useNotes**

Create `src/test/hooks/useNotes.test.js`:

```js
import { renderHook, act, waitFor } from '@testing-library/react'
import '../mocks/supabase'
import { supabase } from '../mocks/supabase'
import { useNotes } from '../../hooks/useNotes'

beforeEach(() => vi.clearAllMocks())

test('loads notes for a topic', async () => {
  supabase.order.mockResolvedValueOnce({ data: [{ id: 'n1', topic_id: 't1', title: 'Lecture 1', content: { strokes: [], version: 1 }, updated_at: '2026-01-01' }], error: null })
  const { result } = renderHook(() => useNotes('t1'))
  await waitFor(() => expect(result.current.notes).toHaveLength(1))
})

test('returns empty array when topicId is null', async () => {
  const { result } = renderHook(() => useNotes(null))
  await waitFor(() => expect(result.current.notes).toEqual([]))
})

test('addNote inserts and refetches', async () => {
  supabase.order.mockResolvedValue({ data: [], error: null })
  supabase.single.mockResolvedValueOnce({ data: { id: 'n2', title: 'New Note' }, error: null })
  const { result } = renderHook(() => useNotes('t1'))
  await act(async () => { await result.current.addNote('New Note') })
  expect(supabase.insert).toHaveBeenCalled()
})

test('updateNoteContent calls update with content and timestamp', async () => {
  supabase.order.mockResolvedValue({ data: [], error: null })
  supabase.eq.mockResolvedValueOnce({ error: null })
  const { result } = renderHook(() => useNotes('t1'))
  await act(async () => { await result.current.updateNoteContent('n1', { strokes: [], version: 1 }) })
  expect(supabase.update).toHaveBeenCalled()
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm run test:run -- src/test/hooks/useNotes.test.js
```
Expected: FAIL.

- [ ] **Step 3: Implement useNotes**

Create `src/hooks/useNotes.js`:

```js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useNotes(topicId) {
  const [notes, setNotes] = useState([])

  const fetchNotes = useCallback(async () => {
    if (!topicId) { setNotes([]); return }
    const { data } = await supabase.from('notes').select('*').eq('topic_id', topicId).order('updated_at', { ascending: false })
    if (data) setNotes(data)
  }, [topicId])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const addNote = async (title) => {
    await supabase.from('notes').insert({ topic_id: topicId, title, content: { strokes: [], version: 1 } }).single()
    await fetchNotes()
  }

  const updateNoteContent = async (id, content) => {
    await supabase.from('notes').update({ content, updated_at: new Date().toISOString() }).eq('id', id)
  }

  const deleteNote = async (id) => {
    await supabase.from('notes').delete().eq('id', id)
    await fetchNotes()
  }

  return { notes, addNote, updateNoteContent, deleteNote }
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm run test:run -- src/test/hooks/useNotes.test.js
```
Expected: PASS (4 tests).

- [ ] **Step 5: Write failing test for NotesList**

Create `src/test/components/NotesList.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import NotesList from '../../components/notes/NotesList'

const notes = [
  { id: 'n1', title: 'Lecture 1', updated_at: '2026-01-01T10:00:00Z' },
  { id: 'n2', title: 'Lecture 2', updated_at: '2026-01-02T10:00:00Z' },
]

test('renders list of notes', () => {
  render(<NotesList notes={notes} onSelect={() => {}} onAdd={() => {}} />)
  expect(screen.getByText('Lecture 1')).toBeInTheDocument()
  expect(screen.getByText('Lecture 2')).toBeInTheDocument()
})

test('calls onSelect when note clicked', () => {
  const onSelect = vi.fn()
  render(<NotesList notes={notes} onSelect={onSelect} onAdd={() => {}} />)
  fireEvent.click(screen.getByText('Lecture 1'))
  expect(onSelect).toHaveBeenCalledWith(notes[0])
})

test('calls onAdd when add note button clicked', () => {
  const onAdd = vi.fn()
  render(<NotesList notes={notes} onSelect={() => {}} onAdd={onAdd} />)
  fireEvent.click(screen.getByRole('button', { name: /add note/i }))
  expect(onAdd).toHaveBeenCalled()
})
```

- [ ] **Step 6: Run to verify it fails**

```bash
npm run test:run -- src/test/components/NotesList.test.jsx
```
Expected: FAIL.

- [ ] **Step 7: Implement NotesList**

Create `src/components/notes/NotesList.jsx`:

```jsx
export default function NotesList({ notes, onSelect, onAdd }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Notes</h2>
        <button aria-label="Add note" onClick={onAdd} style={{ padding: '6px 12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          + Add note
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {notes.map((note) => (
          <div key={note.id} onClick={() => onSelect(note)} style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: '#fff' }}>
            <div style={{ fontWeight: '500' }}>{note.title}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
              {new Date(note.updated_at).toLocaleDateString()}
            </div>
          </div>
        ))}
        {notes.length === 0 && <p style={{ color: '#9ca3af' }}>No notes yet.</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Run to verify it passes**

```bash
npm run test:run -- src/test/components/NotesList.test.jsx
```
Expected: PASS (3 tests).

- [ ] **Step 9: Wire into App.jsx**

Replace `src/App.jsx`:

```jsx
import { useState } from 'react'
import AppShell from './components/layout/AppShell'
import NotesList from './components/notes/NotesList'
import { useClasses } from './hooks/useClasses'
import { useTopics } from './hooks/useTopics'
import { useNotes } from './hooks/useNotes'

export default function App() {
  const { classes, addClass } = useClasses()
  const [activeClassId, setActiveClassId] = useState(null)
  const { topics, addTopic } = useTopics(activeClassId)
  const [activeTopicId, setActiveTopicId] = useState(null)
  const { notes, addNote, updateNoteContent } = useNotes(activeTopicId)
  const [activeNote, setActiveNote] = useState(null)
  const [view, setView] = useState('notes')

  const handleAddClass = async () => { const name = prompt('Class name:'); if (!name) return; await addClass(name) }
  const handleAddTopic = async () => { const name = prompt('Topic name:'); if (!name) return; await addTopic(name) }
  const handleAddNote = async () => { const title = prompt('Note title:'); if (!title) return; await addNote(title) }
  const handleSelectClass = (id) => { setActiveClassId(id); setActiveTopicId(null); setActiveNote(null) }
  const handleSelectTopic = (id) => { setActiveTopicId(id); setActiveNote(null); setView('notes') }

  return (
    <AppShell classes={classes} activeClassId={activeClassId} onSelectClass={handleSelectClass} onAddClass={handleAddClass}
      topics={topics} activeTopicId={activeTopicId} onSelectTopic={handleSelectTopic} onAddTopic={handleAddTopic}>
      {activeTopicId
        ? <NotesList notes={notes} onSelect={setActiveNote} onAdd={handleAddNote} />
        : <p style={{ color: '#9ca3af' }}>Select a topic to get started.</p>}
    </AppShell>
  )
}
```

- [ ] **Step 10: Verify in browser — selecting a topic shows notes list, + Add note prompts for title**

- [ ] **Step 11: Commit**

```bash
git add .
git commit -m "feat: add useNotes hook and NotesList component"
```

---

### Task 7: Handwriting Canvas Note Editor

**Files:**
- Create: `src/components/notes/NoteEditor.jsx`, `src/components/notes/PenToolbar.jsx`, `src/test/components/PenToolbar.test.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Write failing test for PenToolbar**

Create `src/test/components/PenToolbar.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import PenToolbar from '../../components/notes/PenToolbar'

test('renders pen and eraser buttons', () => {
  render(<PenToolbar tool="pen" color="#000000" size={4} onToolChange={() => {}} onColorChange={() => {}} onSizeChange={() => {}} onClear={() => {}} />)
  expect(screen.getByRole('button', { name: /pen/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /eraser/i })).toBeInTheDocument()
})

test('calls onToolChange with eraser when eraser clicked', () => {
  const onToolChange = vi.fn()
  render(<PenToolbar tool="pen" color="#000000" size={4} onToolChange={onToolChange} onColorChange={() => {}} onSizeChange={() => {}} onClear={() => {}} />)
  fireEvent.click(screen.getByRole('button', { name: /eraser/i }))
  expect(onToolChange).toHaveBeenCalledWith('eraser')
})

test('calls onClear when clear button clicked', () => {
  const onClear = vi.fn()
  render(<PenToolbar tool="pen" color="#000000" size={4} onToolChange={() => {}} onColorChange={() => {}} onSizeChange={() => {}} onClear={onClear} />)
  fireEvent.click(screen.getByRole('button', { name: /clear/i }))
  expect(onClear).toHaveBeenCalled()
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm run test:run -- src/test/components/PenToolbar.test.jsx
```
Expected: FAIL.

- [ ] **Step 3: Implement PenToolbar**

Create `src/components/notes/PenToolbar.jsx`:

```jsx
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
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm run test:run -- src/test/components/PenToolbar.test.jsx
```
Expected: PASS (3 tests).

- [ ] **Step 5: Implement NoteEditor**

Create `src/components/notes/NoteEditor.jsx`:

```jsx
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

  const handleClear = () => { setStrokes([]); onSave({ strokes: [], version: 1 }) }

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
```

- [ ] **Step 6: Wire NoteEditor into App.jsx**

Replace `src/App.jsx`:

```jsx
import { useState } from 'react'
import AppShell from './components/layout/AppShell'
import NotesList from './components/notes/NotesList'
import NoteEditor from './components/notes/NoteEditor'
import { useClasses } from './hooks/useClasses'
import { useTopics } from './hooks/useTopics'
import { useNotes } from './hooks/useNotes'

export default function App() {
  const { classes, addClass } = useClasses()
  const [activeClassId, setActiveClassId] = useState(null)
  const { topics, addTopic } = useTopics(activeClassId)
  const [activeTopicId, setActiveTopicId] = useState(null)
  const { notes, addNote, updateNoteContent } = useNotes(activeTopicId)
  const [activeNote, setActiveNote] = useState(null)

  const handleAddClass = async () => { const name = prompt('Class name:'); if (!name) return; await addClass(name) }
  const handleAddTopic = async () => { const name = prompt('Topic name:'); if (!name) return; await addTopic(name) }
  const handleAddNote = async () => { const title = prompt('Note title:'); if (!title) return; await addNote(title) }
  const handleSelectClass = (id) => { setActiveClassId(id); setActiveTopicId(null); setActiveNote(null) }
  const handleSelectTopic = (id) => { setActiveTopicId(id); setActiveNote(null) }

  return (
    <AppShell classes={classes} activeClassId={activeClassId} onSelectClass={handleSelectClass} onAddClass={handleAddClass}
      topics={topics} activeTopicId={activeTopicId} onSelectTopic={handleSelectTopic} onAddTopic={handleAddTopic}>
      {activeNote
        ? <NoteEditor note={activeNote} onSave={(c) => updateNoteContent(activeNote.id, c)} onBack={() => setActiveNote(null)} />
        : activeTopicId
          ? <NotesList notes={notes} onSelect={setActiveNote} onAdd={handleAddNote} />
          : <p style={{ color: '#9ca3af' }}>Select a topic to get started.</p>}
    </AppShell>
  )
}
```

- [ ] **Step 7: Verify on iPad (or Chrome DevTools touch emulation)**

```bash
npm run dev
```
Open Chrome DevTools → device toolbar → iPad Air. Open a note. Draw with mouse/finger.
Expected: Smooth ink strokes. Colour and size toolbar works. Clear empties canvas. Strokes auto-save after 800ms.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add handwriting canvas NoteEditor with PenToolbar"
```

---

### Task 8: Diagram List and Upload

**Files:**
- Create: `src/hooks/useDiagrams.js`, `src/components/diagrams/DiagramList.jsx`, `src/components/diagrams/DiagramSetup.jsx`, `src/test/hooks/useDiagrams.test.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: Write failing tests for useDiagrams**

Create `src/test/hooks/useDiagrams.test.js`:

```js
import { renderHook, act, waitFor } from '@testing-library/react'
import '../mocks/supabase'
import { supabase } from '../mocks/supabase'
import { useDiagrams } from '../../hooks/useDiagrams'

beforeEach(() => vi.clearAllMocks())

test('loads diagrams for a topic', async () => {
  supabase.order.mockResolvedValueOnce({ data: [{ id: 'd1', topic_id: 't1', name: 'Cell', image_url: 'https://x.com/img.jpg', mode: 'labeled' }], error: null })
  const { result } = renderHook(() => useDiagrams('t1'))
  await waitFor(() => expect(result.current.diagrams).toHaveLength(1))
})

test('returns empty array when topicId is null', async () => {
  const { result } = renderHook(() => useDiagrams(null))
  await waitFor(() => expect(result.current.diagrams).toEqual([]))
})

test('addDiagram uploads image and inserts record', async () => {
  supabase.order.mockResolvedValue({ data: [], error: null })
  supabase.single.mockResolvedValueOnce({ data: { id: 'd2' }, error: null })
  const { result } = renderHook(() => useDiagrams('t1'))
  const file = new File(['img'], 'cell.jpg', { type: 'image/jpeg' })
  await act(async () => { await result.current.addDiagram('Cell', file, 'labeled') })
  expect(supabase.storage.from).toHaveBeenCalledWith('diagrams')
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm run test:run -- src/test/hooks/useDiagrams.test.js
```
Expected: FAIL.

- [ ] **Step 3: Implement useDiagrams**

Create `src/hooks/useDiagrams.js`:

```js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useDiagrams(topicId) {
  const [diagrams, setDiagrams] = useState([])

  const fetchDiagrams = useCallback(async () => {
    if (!topicId) { setDiagrams([]); return }
    const { data } = await supabase.from('diagrams').select('*').eq('topic_id', topicId).order('name')
    if (data) setDiagrams(data)
  }, [topicId])

  useEffect(() => { fetchDiagrams() }, [fetchDiagrams])

  const addDiagram = async (name, file, mode) => {
    const path = `${topicId}/${Date.now()}-${file.name}`
    await supabase.storage.from('diagrams').upload(path, file)
    const { data: { publicUrl } } = supabase.storage.from('diagrams').getPublicUrl(path)
    await supabase.from('diagrams').insert({ topic_id: topicId, name, image_url: publicUrl, mode }).single()
    await fetchDiagrams()
  }

  const deleteDiagram = async (id) => {
    await supabase.from('diagrams').delete().eq('id', id)
    await fetchDiagrams()
  }

  const addLabel = async (diagramId, labelData) => {
    await supabase.from('diagram_labels').insert({ diagram_id: diagramId, ...labelData })
  }

  const getLabels = async (diagramId) => {
    const { data } = await supabase.from('diagram_labels').select('*').eq('diagram_id', diagramId)
    return data ?? []
  }

  const deleteLabels = async (diagramId) => {
    await supabase.from('diagram_labels').delete().eq('diagram_id', diagramId)
  }

  return { diagrams, addDiagram, deleteDiagram, addLabel, getLabels, deleteLabels }
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm run test:run -- src/test/hooks/useDiagrams.test.js
```
Expected: PASS (3 tests).

- [ ] **Step 5: Implement DiagramSetup**

Create `src/components/diagrams/DiagramSetup.jsx`:

```jsx
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
```

- [ ] **Step 6: Implement DiagramList**

Create `src/components/diagrams/DiagramList.jsx`:

```jsx
export default function DiagramList({ diagrams, onSelect, onAdd }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Diagrams</h2>
        <button onClick={onAdd} style={{ padding: '6px 12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ Add diagram</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {diagrams.map((d) => (
          <div key={d.id} onClick={() => onSelect(d)} style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '500' }}>{d.name}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{d.mode === 'labeled' ? 'Labels on image' : 'Clean image'}</div>
            </div>
            <span>🖼</span>
          </div>
        ))}
        {diagrams.length === 0 && <p style={{ color: '#9ca3af' }}>No diagrams yet.</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Wire into App.jsx**

Replace `src/App.jsx`:

```jsx
import { useState } from 'react'
import AppShell from './components/layout/AppShell'
import NotesList from './components/notes/NotesList'
import NoteEditor from './components/notes/NoteEditor'
import DiagramList from './components/diagrams/DiagramList'
import DiagramSetup from './components/diagrams/DiagramSetup'
import { useClasses } from './hooks/useClasses'
import { useTopics } from './hooks/useTopics'
import { useNotes } from './hooks/useNotes'
import { useDiagrams } from './hooks/useDiagrams'

export default function App() {
  const { classes, addClass } = useClasses()
  const [activeClassId, setActiveClassId] = useState(null)
  const { topics, addTopic } = useTopics(activeClassId)
  const [activeTopicId, setActiveTopicId] = useState(null)
  const { notes, addNote, updateNoteContent } = useNotes(activeTopicId)
  const { diagrams, addDiagram, addLabel, getLabels } = useDiagrams(activeTopicId)
  const [activeNote, setActiveNote] = useState(null)
  const [activeDiagram, setActiveDiagram] = useState(null)
  const [view, setView] = useState('notes')

  const handleAddClass = async () => { const name = prompt('Class name:'); if (!name) return; await addClass(name) }
  const handleAddTopic = async () => { const name = prompt('Topic name:'); if (!name) return; await addTopic(name) }
  const handleAddNote = async () => { const title = prompt('Note title:'); if (!title) return; await addNote(title) }
  const handleSelectClass = (id) => { setActiveClassId(id); setActiveTopicId(null); setActiveNote(null); setActiveDiagram(null) }
  const handleSelectTopic = (id) => { setActiveTopicId(id); setActiveNote(null); setActiveDiagram(null); setView('notes') }
  const handleUploadDiagram = async (name, file, mode) => { await addDiagram(name, file, mode); setView('diagrams') }

  const renderContent = () => {
    if (activeNote) return <NoteEditor note={activeNote} onSave={(c) => updateNoteContent(activeNote.id, c)} onBack={() => setActiveNote(null)} />
    if (activeDiagram) return <div><button onClick={() => setActiveDiagram(null)}>← Back</button><p style={{marginTop:'8px',color:'#9ca3af'}}>Quiz coming in Task 9.</p></div>
    if (view === 'addDiagram') return <DiagramSetup onUpload={handleUploadDiagram} />
    if (!activeTopicId) return <p style={{ color: '#9ca3af' }}>Select a topic to get started.</p>
    return (
      <div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['notes', 'diagrams'].map((v) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: view === v ? '#6366f1' : '#e5e7eb', color: view === v ? '#fff' : '#374151', cursor: 'pointer', textTransform: 'capitalize' }}>{v}</button>
          ))}
        </div>
        {view === 'notes' && <NotesList notes={notes} onSelect={setActiveNote} onAdd={handleAddNote} />}
        {view === 'diagrams' && <DiagramList diagrams={diagrams} onSelect={setActiveDiagram} onAdd={() => setView('addDiagram')} />}
      </div>
    )
  }

  return (
    <AppShell classes={classes} activeClassId={activeClassId} onSelectClass={handleSelectClass} onAddClass={handleAddClass}
      topics={topics} activeTopicId={activeTopicId} onSelectTopic={handleSelectTopic} onAddTopic={handleAddTopic}>
      {renderContent()}
    </AppShell>
  )
}
```

- [ ] **Step 8: Verify in browser — Notes/Diagrams tabs appear, upload form works**

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add diagram list, upload form, and useDiagrams hook"
```

---

### Task 9: Mode A — Labeled Image Setup

**Files:**
- Create: `src/components/diagrams/LabeledSetup.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Implement LabeledSetup**

Create `src/components/diagrams/LabeledSetup.jsx`:

```jsx
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
```

- [ ] **Step 2: Wire LabeledSetup into App.jsx**

In `src/App.jsx`, add import:

```jsx
import LabeledSetup from './components/diagrams/LabeledSetup'
```

Replace the `activeDiagram` block in `renderContent()`:

```jsx
if (activeDiagram) {
  return (
    <LabeledSetup
      diagram={activeDiagram}
      onSaveLabels={async (labels) => { for (const l of labels) await addLabel(activeDiagram.id, l) }}
      onDone={() => setActiveDiagram(null)}
    />
  )
}
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```
Expected: Clicking a Mode A diagram opens the canvas. Draw a rectangle → type label → it turns purple. Save & quiz returns to list.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add Mode A labeled image setup with Konva rectangle drawing"
```

---

### Task 10: Mode B — Clean Image Setup

**Files:**
- Create: `src/components/diagrams/CleanSetup.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Implement CleanSetup**

Create `src/components/diagrams/CleanSetup.jsx`:

```jsx
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
```

- [ ] **Step 2: Wire CleanSetup into App.jsx**

Add import to `src/App.jsx`:

```jsx
import CleanSetup from './components/diagrams/CleanSetup'
```

Replace the `activeDiagram` block in `renderContent()` to branch on mode:

```jsx
if (activeDiagram && activeDiagram.mode === 'labeled') {
  return <LabeledSetup diagram={activeDiagram} onSaveLabels={async (labels) => { for (const l of labels) await addLabel(activeDiagram.id, l) }} onDone={() => setActiveDiagram(null)} />
}
if (activeDiagram && activeDiagram.mode === 'clean') {
  return <CleanSetup diagram={activeDiagram} onSaveLabels={async (labels) => { for (const l of labels) await addLabel(activeDiagram.id, l) }} onDone={() => setActiveDiagram(null)} />
}
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```
Expected: Clicking a Mode B diagram shows clean image. Clicking places a red dot, prompts for label text, saves as purple pin with text. Save & quiz returns to list.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add Mode B clean image setup with pin placement"
```

---

### Task 11: Quiz Mode

**Files:**
- Create: `src/components/diagrams/QuizMode.jsx`, `src/test/components/QuizMode.test.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Write failing tests for QuizMode**

Create `src/test/components/QuizMode.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import QuizMode from '../../components/diagrams/QuizMode'

const labeledDiagram = { id: 'd1', name: 'Cell', image_url: 'https://example.com/cell.jpg', mode: 'labeled' }
const labels = [
  { id: 'l1', label_text: 'Nucleus', x: 10, y: 10, width: 60, height: 20 },
  { id: 'l2', label_text: 'Mitochondria', x: 100, y: 100, width: 80, height: 20 },
]

test('renders a submit button', () => {
  render(<QuizMode diagram={labeledDiagram} labels={labels} onBack={() => {}} />)
  expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
})

test('shows score after submit', () => {
  render(<QuizMode diagram={labeledDiagram} labels={labels} onBack={() => {}} />)
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))
  expect(screen.getByText(/score/i)).toBeInTheDocument()
})

test('calls onBack when back button clicked', () => {
  const onBack = vi.fn()
  render(<QuizMode diagram={labeledDiagram} labels={labels} onBack={onBack} />)
  fireEvent.click(screen.getByRole('button', { name: /back/i }))
  expect(onBack).toHaveBeenCalled()
})

test('correct answer shown in green after submit', () => {
  render(<QuizMode diagram={labeledDiagram} labels={labels} onBack={() => {}} />)
  const inputs = screen.getAllByPlaceholderText(/your answer/i)
  fireEvent.change(inputs[0], { target: { value: 'Nucleus' } })
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))
  expect(screen.getByText('✓ Correct')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm run test:run -- src/test/components/QuizMode.test.jsx
```
Expected: FAIL.

- [ ] **Step 3: Implement QuizMode**

Create `src/components/diagrams/QuizMode.jsx`:

```jsx
import { useState } from 'react'
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
  const correctCount = submitted ? labels.filter((l) => normalize(answers[l.id] ?? '') === normalize(l.label_text)).length : null

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
              const correct = submitted && normalize(answers[l.id] ?? '') === normalize(l.label_text)
              const wrong = submitted && !correct
              return <Rect key={l.id} x={l.x} y={l.y} width={l.width} height={l.height} fill={!submitted ? '#374151' : correct ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)'} stroke={!submitted ? '#1f2937' : correct ? '#16a34a' : '#dc2626'} strokeWidth={1} />
            })}
            {diagram.mode === 'clean' && labels.map((l, i) => (
              <>
                <Circle key={`c-${l.id}`} x={l.pin_x} y={l.pin_y} radius={10} fill="#6366f1" stroke="#fff" strokeWidth={2} />
                <Text key={`t-${l.id}`} x={l.pin_x - 4} y={l.pin_y - 6} text={String(i + 1)} fontSize={11} fill="#fff" fontStyle="bold" />
              </>
            ))}
          </Layer>
        </Stage>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '420px' }}>
          {labels.map((l, i) => {
            const correct = submitted && normalize(answers[l.id] ?? '') === normalize(l.label_text)
            const wrong = submitted && !correct
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
                {submitted && wrong && <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>✗ {l.label_text}</div>}
                {submitted && correct && <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '2px' }}>✓ Correct</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- src/test/components/QuizMode.test.jsx
```
Expected: PASS (4 tests).

- [ ] **Step 5: Wire QuizMode into App.jsx**

Add import to `src/App.jsx`:

```jsx
import QuizMode from './components/diagrams/QuizMode'
```

Add state:

```jsx
const [quizDiagram, setQuizDiagram] = useState(null)
const [quizLabels, setQuizLabels] = useState([])
```

Add handler:

```jsx
const handleOpenDiagram = async (diagram) => {
  const labels = await getLabels(diagram.id)
  if (labels.length === 0) { setActiveDiagram(diagram); return }
  setQuizLabels(labels)
  setQuizDiagram(diagram)
}
```

Add quiz block at top of `renderContent()`:

```jsx
if (quizDiagram) return <QuizMode diagram={quizDiagram} labels={quizLabels} onBack={() => setQuizDiagram(null)} />
```

Update DiagramList onSelect to use `handleOpenDiagram`:

```jsx
{view === 'diagrams' && <DiagramList diagrams={diagrams} onSelect={handleOpenDiagram} onAdd={() => setView('addDiagram')} />}
```

- [ ] **Step 6: Run all tests**

```bash
npm run test:run
```
Expected: All tests PASS.

- [ ] **Step 7: Verify full quiz flow in browser**

```bash
npm run dev
```
Expected:
1. Create class → topic → add Mode A diagram → draw label rects → Save & quiz
2. Click diagram again → quiz opens, labels covered by black boxes, answer inputs on right
3. Type answers → Submit → green/red boxes, score shown
4. Retry clears answers and resets

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add QuizMode with scoring and reveal for both diagram modes"
```

---

## Spec Coverage Check

| Requirement | Task |
|---|---|
| Web app, browser-based (iPad + laptop) | Task 1 |
| No login, hardcoded credentials | Task 2 |
| Class → Topic → Notes hierarchy | Tasks 4, 5, 6 |
| Handwritten notes, Apple Pencil | Task 7 (perfect-freehand SVG canvas) |
| Pen colour picker | Task 7 (PenToolbar — 6 colours) |
| Pen thickness + eraser | Task 7 (PenToolbar — 4 sizes, eraser mode) |
| Stroke data stored as JSON | Task 6 (notes.content jsonb) |
| Notes searchable by title only | Task 6 (no content indexing) |
| Diagram Mode A: draw rects over printed labels | Task 9 (LabeledSetup) |
| Diagram Mode B: click to place pins | Task 10 (CleanSetup) |
| Quiz: cover labels, type answers, reveal | Task 11 (QuizMode) |
| Green/red scoring on reveal | Task 11 |
| Images in Supabase Storage | Tasks 2 + 8 |
| Data synced across devices | Task 2 (Supabase cloud) |

All requirements covered. ✓
