import { render, screen, fireEvent } from '@testing-library/react'
import ClassTabs from '../../components/layout/ClassTabs'

const classes = [
  { id: '1', name: 'Biology 101', color: '#6366f1' },
  { id: '2', name: 'Anatomy', color: '#ec4899' },
]

test('renders a tab for each class', () => {
  render(<ClassTabs classes={classes} activeId="1" onSelect={() => {}} onAdd={() => {}} onDelete={() => {}} />)
  expect(screen.getByText('Biology 101')).toBeInTheDocument()
  expect(screen.getByText('Anatomy')).toBeInTheDocument()
})

test('calls onSelect with class id when tab clicked', () => {
  const onSelect = vi.fn()
  render(<ClassTabs classes={classes} activeId="1" onSelect={onSelect} onAdd={() => {}} onDelete={() => {}} />)
  fireEvent.click(screen.getByText('Anatomy'))
  expect(onSelect).toHaveBeenCalledWith('2')
})

test('calls onAdd when + button clicked', () => {
  const onAdd = vi.fn()
  render(<ClassTabs classes={classes} activeId="1" onSelect={() => {}} onAdd={onAdd} onDelete={() => {}} />)
  fireEvent.click(screen.getByRole('button', { name: 'Add class' }))
  expect(onAdd).toHaveBeenCalled()
})
