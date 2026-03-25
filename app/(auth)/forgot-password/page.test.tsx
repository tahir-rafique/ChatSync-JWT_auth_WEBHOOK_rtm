import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/tests/test-utils'
import { describe, it, expect } from 'vitest'
import ForgotPasswordPage from './page'

describe('Forgot Password Page Integration', () => {
    it('renders the forgot password form correctly', async () => {
        render(<ForgotPasswordPage />)
        expect(await screen.findByText(/Forgot password\?/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument()
    })

    it('submits successfully and shows success state', async () => {
        render(<ForgotPasswordPage />)
        const emailInput = await screen.findByPlaceholderText(/Enter your email/i)
        const submitButton = screen.getByRole('button', { name: /Send Verification Code/i })

        fireEvent.change(emailInput, { target: { value: 'test-reset@example.com' } })
        fireEvent.click(submitButton)

        // Wait for MSW mock response and state transition
        await waitFor(() => {
            expect(screen.getByText(/Check your email/i)).toBeInTheDocument()
            expect(screen.getByText(/test-reset@example.com/i)).toBeInTheDocument()
        })
    })

    it('back to login link exists', async () => {
        render(<ForgotPasswordPage />)
        await screen.findByText(/Forgot password\?/i)
        expect(screen.getByText(/Back to sign in/i)).toBeInTheDocument()
    })
})
