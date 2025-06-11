import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthRedirect from '../AuthRedirect';
import { useAuth } from '../../../hooks/useAuth';

// Мокаем useAuth
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

// Мокаем useLocation
const mockLocation = { 
  pathname: '/login',
  state: { from: '/protected' }
};
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

describe('AuthRedirect Component', () => {
  const mockChildren = <div>Auth Content</div>;

  beforeEach(() => {
    useAuth.mockClear();
  });

  it('renders children when user is not authenticated', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false
    });

    renderWithRouter(<AuthRedirect>{mockChildren}</AuthRedirect>);

    expect(screen.getByText('Auth Content')).toBeInTheDocument();
  });

  it('shows loading spinner when auth is loading', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true
    });

    renderWithRouter(<AuthRedirect>{mockChildren}</AuthRedirect>);

    expect(screen.queryByText('Auth Content')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /loading/i })).toBeInTheDocument();
  });

  it('redirects to previous location when user is authenticated', () => {
    useAuth.mockReturnValue({
      user: { id: '1' },
      loading: false
    });

    renderWithRouter(<AuthRedirect>{mockChildren}</AuthRedirect>);

    expect(screen.queryByText('Auth Content')).not.toBeInTheDocument();
    expect(window.location.pathname).toBe('/protected');
  });

  it('redirects to home when no previous location', () => {
    useAuth.mockReturnValue({
      user: { id: '1' },
      loading: false
    });

    // Мокаем location без state
    mockLocation.state = undefined;

    renderWithRouter(<AuthRedirect>{mockChildren}</AuthRedirect>);

    expect(screen.queryByText('Auth Content')).not.toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });
}); 