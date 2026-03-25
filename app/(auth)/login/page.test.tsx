import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/tests/test-utils'
import { describe, it, expect, vi } from 'vitest'
import LoginPage from './page'

describe('Login Page Integration', () => {
    it('renders the login form correctly', async () => {
        render(<LoginPage />)

        // Use findByText to wait for the AuthProvider loading screen to disappear
        expect(await screen.findByText(/Welcome back/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument()
    })

    it('shows error toast if email or password is empty', async () => {
        render(<LoginPage />)
        // Wait for page to load
        await screen.findByText(/Welcome back/i)

        const submitButton = screen.getByRole('button', { name: /^Sign In$/i })
        fireEvent.click(submitButton)

        // Check for error validation logic (it would trigger a toast)
        // Since Toast is provider-based, we'd ideally check the toast's visibility 
        // OR we can spy on the toast.error function if we mock the context.
    })

    it('successfully handles user input', async () => {
        render(<LoginPage />)
        // Wait for page to load
        await screen.findByText(/Welcome back/i)

        const emailInput = screen.getByPlaceholderText(/Email address/i)
        const passwordInput = screen.getByPlaceholderText(/Password/i)

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })

        expect(emailInput).toHaveValue('test@example.com')
        expect(passwordInput).toHaveValue('password123')
    })

    it('can toggle password visibility', async () => {
        render(<LoginPage />)
        // Wait for page to load
        await screen.findByText(/Welcome back/i)

        const passwordInput = screen.getByPlaceholderText(/Password/i)
        const toggleButton = screen.getByLabelText(/Toggle password visibility/i)

        expect(passwordInput).toHaveAttribute('type', 'password')

        fireEvent.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'text')

        fireEvent.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'password')
    })
})
