import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AdminPanel from './AdminPanel';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock supabaseClient.tsx
jest.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: '123' } }, error: null })),
    },
    from: jest.fn((table) => {
      if (table === 'profiles') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: { id: '123', role: 'ADMIN' }, error: null })),
            })),
          })),
        };
      }
      if (table === 'profile_permissions') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ data: [{ permission_name: 'CAN_USE_ENHANCED_CARD' }], error: null })),
          })),
        };
      }
      return {
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          range: jest.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
        })),
        insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
        update: jest.fn(() => Promise.resolve({ data: [], error: null })),
      };
    }),
  },
}));

// Mock the useAuthStore
jest.mock('../../stores/authStore', () => ({
  useAuthStore: jest.fn(() => ({
    session: { access_token: 'mock-token' },
    profile: { role: 'ADMIN' },
    loading: false,
    signOut: jest.fn(),
  })),
}));

// Mock useSWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn((key) => {
    if (key && key[0].includes('/admin/dashboard')) {
      return {
        data: { totalUsers: 10, activeSessions: 5, recentActivities: [], userRoles: [] },
        error: null,
        isLoading: false,
      };
    } else if (key && key[0].includes('/profile/permissions')) {
      return {
        data: ['can_view_dashboard', 'can_manage_certificates', 'can_create_cafe_owners', 'can_manage_cards', 'can_create_player_ids'],
        error: null,
        isLoading: false,
      };
    }
    return {
      data: null,
      error: null,
      isLoading: false,
    };
  }),
}));

// Mock EnhancedCardGenerator to avoid canvas issues
jest.mock('../cards/EnhancedCardGenerator', () => {
  return jest.fn(() => <div>Mocked EnhancedCardGenerator</div>);
});

describe('AdminPanel', () => {
  it('renders without crashing', async () => {
    render(
      <Router>
        <AdminPanel />
      </Router>
    );
    expect(await screen.findByRole('heading', { name: /Admin Dashboard/i })).toBeInTheDocument();
  });
});
