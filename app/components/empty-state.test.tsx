import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import EmptyState from './empty-state'

/**
 * Conventional Testing Pattern:
 * 1. Arrange: Set up props and render the component
 * 2. Act: Perform user interactions (if applicable)
 * 3. Assert: Check if the expected outcome occurred
 */
describe('EmptyState Component', () => {
    const defaultProps = {
        onOpenFriends: vi.fn(),
        onOpenAddFriend: vi.fn(),
    }

    it('renders the welcome message correctly', () => {
        render(<EmptyState {...defaultProps} />)

        expect(screen.getByText(/Welcome to ChatSync/i)).toBeInTheDocument()
        expect(screen.getByText(/Select a conversation from the sidebar/i)).toBeInTheDocument()
    })

    it('calls onOpenFriends when "View Friends" button is clicked', () => {
        render(<EmptyState {...defaultProps} />)

        const friendsButton = screen.getByRole('button', { name: /View Friends/i })
        fireEvent.click(friendsButton)

        expect(defaultProps.onOpenFriends).toHaveBeenCalledTimes(1)
    })

    it('calls onOpenAddFriend when "Add Friends" button is clicked', () => {
        render(<EmptyState {...defaultProps} />)

        const addFriendButton = screen.getByRole('button', { name: /Add Friends/i })
        fireEvent.click(addFriendButton)

        expect(defaultProps.onOpenAddFriend).toHaveBeenCalledTimes(1)
    })

    it('displays the feature cards', () => {
        render(<EmptyState {...defaultProps} />)

        expect(screen.getByText(/Real-time Chat/i)).toBeInTheDocument()
        expect(screen.getByText(/File Sharing/i)).toBeInTheDocument()
        expect(screen.getByText(/Voice & Video/i)).toBeInTheDocument()
    })
})
