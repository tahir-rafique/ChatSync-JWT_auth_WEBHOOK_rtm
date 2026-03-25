import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/tests/test-utils'
import { describe, it, expect } from 'vitest'
import NewPasswordPage from './page'

describe('New Password Page Integration', () => {
    it('renders the password reset form', async () => {
        render(<NewPasswordPage />)
        // Wait for page to load
        expect(await screen.findByText(/Set new password/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/^New password$/i)).toBeInTheDocument()
    })

    it('requires a strong password and matching confirmation', async () => {
        render(<NewPasswordPage />)
        // Wait for page to load
        await screen.findByText(/Set new password/i)

        const passwordInput = screen.getByPlaceholderText(/^New password$/i)
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i)
        const submitButton = screen.getByRole('button', { name: /Reset Password/i })

        // 1. Not matching
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
        fireEvent.change(confirmInput, { target: { value: 'Other123!' } })
        expect(submitButton).toBeDisabled()

        // 2. Too weak (no special character, etc.)
        fireEvent.change(passwordInput, { target: { value: '123' } })
        fireEvent.change(confirmInput, { target: { value: '123' } })
        expect(submitButton).toBeDisabled()

        // 3. Matching and strong
        fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } })
        fireEvent.change(confirmInput, { target: { value: 'StrongPass123!' } })

        await waitFor(() => {
            expect(submitButton).not.toBeDisabled()
        })

        fireEvent.click(submitButton)
        expect(await screen.findByText(/Password reset!/i)).toBeInTheDocument()
    })
})
