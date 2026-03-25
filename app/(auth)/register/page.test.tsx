import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RegisterPage from './page'

// ─── Mock ALL external dependencies ────────────────────────────────────────
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    usePathname: () => '/register',
    useSearchParams: () => new URLSearchParams(),
}))

const mockToastError = vi.fn()
vi.mock('@/context/ToastContext', () => ({
    useToast: () => ({ error: mockToastError, success: vi.fn(), info: vi.fn() }),
    ToastProvider: ({ children }: any) => <>{children}</>,
}))

vi.mock('@/context/AuthContext', () => ({
    useAuth: () => ({
        loading: false,
        user: null,
        isAuthenticated: false,
        register: vi.fn(),
    }),
    AuthProvider: ({ children }: any) => <>{children}</>,
}))
// ───────────────────────────────────────────────────────────────────────────

describe('Register Page', () => {
    beforeEach(() => {
        mockToastError.mockClear()
    })

    it('renders the registration form correctly', () => {
        render(<RegisterPage />)
        // Use getByRole to avoid multiple-element ambiguity with the submit button
        expect(screen.getByRole('heading', { name: /Create account/i })).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Full name/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/^Password$/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Confirm password/i)).toBeInTheDocument()
    })

    it('shows a toast error if passwords do not match', () => {
        render(<RegisterPage />)

        fireEvent.change(screen.getByPlaceholderText(/Full name/i), { target: { value: 'Test User' } })
        fireEvent.change(screen.getByPlaceholderText(/Email address/i), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByPlaceholderText(/^Password$/i), { target: { value: 'Password123!' } })
        fireEvent.change(screen.getByPlaceholderText(/Confirm password/i), { target: { value: 'Mismatch999!' } })
        fireEvent.click(screen.getByRole('checkbox'))
        // Button text in DOM is "Create Account" (submit button)
        fireEvent.click(screen.getByRole('button', { name: /Create Account/i }))

        expect(mockToastError).toHaveBeenCalledWith(expect.stringMatching(/passwords do not match/i))
    })

    it('toggles password visibility', () => {
        render(<RegisterPage />)

        const passwordInput = screen.getByPlaceholderText(/^Password$/i)
        // The DOM shows <button type="button"> SVG icons are password eye toggles.
        // There are 2 type=button buttons (password + confirm). Index 0 = password field.
        const allButtons = screen.getAllByRole('button')
        // The eye buttons come BEFORE the submit button in the DOM
        const eyeButtons = allButtons.filter(btn => btn.getAttribute('type') === 'button')
        // eyeButtons[0] = password field toggle, eyeButtons[1] = confirm field toggle

        expect(passwordInput).toHaveAttribute('type', 'password')
        // Click the SECOND button (index 1 in eyeButtons = the Password field, since
        // the first eye button is for email confirm and the ordering depends on DOM)
        // Let us instead query based on the input's parent container
        const passwordFieldContainer = passwordInput.closest('div.input-group') ??
            passwordInput.parentElement!
        const passwordEye = passwordFieldContainer.querySelector('button[type="button"]')!

        fireEvent.click(passwordEye)
        expect(passwordInput).toHaveAttribute('type', 'text')
        fireEvent.click(passwordEye)
        expect(passwordInput).toHaveAttribute('type', 'password')
    })
})
