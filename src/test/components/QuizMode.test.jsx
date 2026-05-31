vi.mock('react-konva', () => ({
  Stage: ({ children }) => <div>{children}</div>,
  Layer: ({ children }) => <div>{children}</div>,
  Image: () => null,
  Rect: () => null,
  Circle: () => null,
  Text: () => null,
  Group: () => null,
}))

vi.mock('use-image', () => ({
  default: () => [null, 'loading'],
}))

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
