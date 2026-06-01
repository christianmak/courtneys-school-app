import { render, screen, fireEvent } from '@testing-library/react'
import NotesList from '../../components/notes/NotesList'

const notes = [
  { id: 'n1', title: 'Lecture 1', updated_at: '2026-01-01T10:00:00Z' },
  { id: 'n2', title: 'Lecture 2', updated_at: '2026-01-02T10:00:00Z' },
]

test('renders list of notes', () => {
  render(<NotesList notes={notes} onSelect={() => {}} onAdd={() => {}} onDelete={() => {}} />)
  expect(screen.getByText('Lecture 1')).toBeInTheDocument()
  expect(screen.getByText('Lecture 2')).toBeInTheDocument()
})

test('calls onSelect when note clicked', () => {
  const onSelect = vi.fn()
  render(<NotesList notes={notes} onSelect={onSelect} onAdd={() => {}} onDelete={() => {}} />)
  fireEvent.click(screen.getByText('Lecture 1'))
  expect(onSelect).toHaveBeenCalledWith(notes[0])
})

test('calls onAdd when add note button clicked', () => {
  const onAdd = vi.fn()
  render(<NotesList notes={notes} onSelect={() => {}} onAdd={onAdd} onDelete={() => {}} />)
  fireEvent.click(screen.getByRole('button', { name: /add note/i }))
  expect(onAdd).toHaveBeenCalled()
})
