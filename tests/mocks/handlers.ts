import { http, HttpResponse } from 'msw'

/**
 * Enterprise standard for API mocking: MSW (Mock Service Worker).
 * We define request handlers that match the real API endpoints.
 */
export const handlers = [
  // Mock login endpoint
  http.post('*/api/v1/auth/login', () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        token: 'mock-jwt-token',
        user: { id: '1', name: 'John Doe', email: 'john@example.com' }
      }
    })
  }),

  // Mock "Me" endpoint (Initial auth check)
  http.get('*/api/v1/auth/me', () => {
    // Return 401 or null user to simulate "not logged in"
    return HttpResponse.json({
        status: 'error',
        message: 'Not authenticated'
    }, { status: 401 })
  }),

  // Mock Registration
  http.post('*/api/v1/auth/register', () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        user: { id: '2', name: 'New User', email: 'new@example.com' },
        token: 'new-user-token'
      }
    })
  }),

  // Mock Forgot Password
  http.post('*/api/v1/auth/forgot-password', () => {
    return HttpResponse.json({
      status: 'success',
      message: 'Reset link sent to your email'
    })
  }),

  // Mock Reset Password with Token
  http.post('*/api/v1/auth/reset-password/:token', () => {
    return HttpResponse.json({
      status: 'success',
      message: 'Password reset successfully'
    })
  }),

  // Mock list of friends 
  http.get('*/api/v1/friends', () => {
    return HttpResponse.json({
      status: 'success',
      data: [
        { id: '1', name: 'Alice', avatar: '/alice.png', online: true },
        { id: '2', name: 'Bob', avatar: '/bob.png', online: false },
      ]
    })
  }),
]
