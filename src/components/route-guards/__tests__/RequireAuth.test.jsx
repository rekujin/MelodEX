import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RequireAuth from '../RequireAuth';
import { useAuth } from '../../../hooks/useAuth';

// Мокаем useAuth
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

// Мокаем useLocation
const mockLocation = { pathname: '/protected' };
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('RequireAuth Component', () => {
  const mockChildren = <div>Protected Content</div>;

  beforeEach(() => {
    useAuth.mockClear();
  });

  it('renders children when user is authenticated', () => {
    useAuth.mockReturnValue({
      user: { id: '1' },
      loading: false
    });

    renderWithRouter(<RequireAuth>{mockChildren}</RequireAuth>);

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows loading spinner when auth is loading', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true
    });

    renderWithRouter(<RequireAuth>{mockChildren}</RequireAuth>);

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /loading/i })).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false
    });

    renderWithRouter(<RequireAuth>{mockChildren}</RequireAuth>);

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });

  it('preserves the attempted URL in location state', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false
    });

    renderWithRouter(<RequireAuth>{mockChildren}</RequireAuth>);

    expect(window.location.pathname).toBe('/login');
    expect(window.location.state).toEqual({ from: '/protected' });
  });
}); 