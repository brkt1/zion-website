import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SuperAdminManageUserRoutes from './SuperAdminManageUserRoutes';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock window.alert
const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

// Mock useAuthStore
jest.mock('../../stores/authStore', () => ({
  useAuthStore: jest.fn(() => ({
    session: { access_token: 'mock-super-admin-token' },
    profile: { role: 'SUPER_ADMIN' },
    loading: false,
    signOut: jest.fn(),
  })),
}));

// Mock useSWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn((key) => {
    if (key && key[0].includes('/profile/all')) {
      return {
        data: [
          { id: 'user1', email: 'user1@example.com', role: 'USER', route_access: ['trivia'] },
          { id: 'user2', email: 'user2@example.com', role: 'ADMIN', route_access: ['truth-dare', 'rock-paper-scissors'] },
          { id: 'user3', email: 'user3@example.com', role: 'CAFE_OWNER', route_access: [] },
        ],
        error: null,
        isLoading: false,
        mutate: jest.fn(),
      };
    }
    return {
      data: null,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    };
  }),
}));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'Success' }),
  })
);

describe('SuperAdminManageUserRoutes', () => {
  it('renders without crashing and displays user data', async () => {
    render(
      <Router>
        <SuperAdminManageUserRoutes />
      </Router>
    );

    expect(screen.getByText(/Manage User Route Access/i)).toBeInTheDocument();
    expect(screen.getByText(/user1@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/user2@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/user3@example.com/i)).toBeInTheDocument();

    // Check initial route access display
    expect(screen.getByText(/Trivia Game/i)).toBeInTheDocument();
    expect(screen.getByText(/Truth or Dare, Rock Paper Scissors/i)).toBeInTheDocument();
    expect(screen.getByText(/None/i)).toBeInTheDocument();
  });

  it('allows editing user routes', async () => {
    const user = userEvent.setup();
    render(
      <Router>
        <SuperAdminManageUserRoutes />
      </Router>
    );

    // Find the edit button for user1 and click it
    const editButton = screen.getAllByRole('button', { name: /Edit Routes/i })[0];
    await user.click(editButton);

    // Verify the edit form appears
    expect(screen.getByText(/Select Routes for user1@example.com:/i)).toBeInTheDocument();

    // Toggle a route
    const emojiGameCheckbox = screen.getByLabelText(/Emoji Game/i);
    await user.click(emojiGameCheckbox);

    // Save changes
    const saveButton = screen.getByRole('button', { name: /Save Routes/i });
    await user.click(saveButton);

    // Verify fetch was called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/profile/user1/route-access'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ route_access: ['trivia', 'emoji'] }),
        })
      );
    });

    // Verify alert was called
    expect(window.alert).toHaveBeenCalledWith('User routes updated successfully!');
  });
});
