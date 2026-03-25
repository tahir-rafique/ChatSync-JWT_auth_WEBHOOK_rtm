import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@/tests/test-utils'
import { describe, it, expect, vi } from 'vitest'
import OtpPage from './page'

describe('OTP Verification Page', () => {
    it('renders the OTP inputs', async () => {
        render(<OtpPage />)
        expect(await screen.findByText(/Verify your email/i)).toBeInTheDocument()

        const inputs = screen.getAllByRole('textbox')
        expect(inputs).toHaveLength(6)
    })

    it('enables the verify button when OTP is complete', async () => {
        render(<OtpPage />)
        // Wait for page to load
        await screen.findByText(/Verify your email/i)

        const inputs = screen.getAllByRole('textbox')
        const submitButton = screen.getByRole('button', { name: /Verify Code/i })

        expect(submitButton).toBeDisabled()

        // Fill in digits 123456
        inputs.forEach((input, index) => {
            fireEvent.change(input, { target: { value: index + 1 } })
        })

        await waitFor(() => {
            expect(submitButton).not.toBeDisabled()
        })
    })

    it('shows resend timer text initially', async () => {
        render(<OtpPage />)
        await screen.findByText(/Verify your email/i)

        // The countdown starts immediately; just verify it's counting
        expect(screen.getByText(/Resend code in/i)).toBeInTheDocument()
    })
})
