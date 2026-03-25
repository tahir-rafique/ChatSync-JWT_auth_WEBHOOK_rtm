import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/tests/test-utils'
import { describe, it, expect, vi } from 'vitest'
import ResetPasswordPage from './page'

// Mocking useParams to provide a mock token
vi.mock('next/navigation', () => ({
    useParams: () => ({ token: 'mock-token-123' }),
    useRouter: () => ({
        push: vi.fn(),
    }),
    usePathname: () => '/reset-password/mock-token-123',
}))

describe('Reset Password Page with Token', () => {
    it('renders the reset password form with the token context', async () => {
        render(<ResetPasswordPage />)
        // Wait for page to load
        expect(await screen.findByText(/Set new password/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/^New password$/i)).toBeInTheDocument()
    })

    it('submits correctly to the token-based endpoint', async () => {
        render(<ResetPasswordPage />)
        // Wait for page to load
        const passwordInput = await screen.findByPlaceholderText(/^New password$/i)
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i)
        const submitButton = screen.getByRole('button', { name: /Update Password/i })

        fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } })
        fireEvent.change(confirmInput, { target: { value: 'StrongPassword123!' } })

        // Wait for validation check
        await waitFor(() => {
            expect(submitButton).not.toBeDisabled()
        })

        fireEvent.click(submitButton)

        // Wait for success message from API response
        await waitFor(() => {
            expect(screen.getByText(/All set!/i)).toBeInTheDocument()
            expect(screen.getByText(/Password reset successfully/i)).toBeInTheDocument()
        })
    })

    it('should NOT disable submit button for weak password (local validation)', async () => {
        render(<ResetPasswordPage />)
        // Wait for page to load
        const passwordInput = await screen.findByPlaceholderText(/^New password$/i)
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i)
        const submitButton = screen.getByRole('button', { name: /Update Password/i })

        fireEvent.change(passwordInput, { target: { value: 'weak' } })
        fireEvent.change(confirmInput, { target: { value: 'weak' } })

        // Button is still enabled (but will fail on click)
        expect(submitButton).not.toBeDisabled()
    })
})
