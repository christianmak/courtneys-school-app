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
