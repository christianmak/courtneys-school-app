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
