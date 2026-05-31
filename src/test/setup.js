import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('react-konva', () => ({
  Stage: ({ children }) => children,
  Layer: ({ children }) => children,
  Image: () => null,
  Rect: () => null,
  Circle: () => null,
  Text: () => null,
  Group: ({ children }) => children,
}))

vi.mock('use-image', () => ({
  default: () => [null, 'loading'],
}))
