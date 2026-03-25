import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Set up server for MSW node (tests run in Node)
export const server = setupServer(...handlers)
