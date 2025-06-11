import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PlaylistGuard from '../PlaylistGuard';

// Мокаем useLocation
const mockLocation = { 
  pathname: '/playlist/edit',
  state: { playlistData: { id: '1', title: 'Test Playlist' } }
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

describe('PlaylistGuard Component', () => {
  const mockChildren = <div>Playlist Edit Content</div>;

  it('renders children when playlist data is present', () => {
    renderWithRouter(<PlaylistGuard>{mockChildren}</PlaylistGuard>);

    expect(screen.getByText('Playlist Edit Content')).toBeInTheDocument();
  });

  it('redirects to home when playlist data is missing', () => {
    // Мокаем location без playlistData
    mockLocation.state = undefined;

    renderWithRouter(<PlaylistGuard>{mockChildren}</PlaylistGuard>);

    expect(screen.queryByText('Playlist Edit Content')).not.toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });

  it('redirects to home when state is null', () => {
    // Мокаем location с null state
    mockLocation.state = null;

    renderWithRouter(<PlaylistGuard>{mockChildren}</PlaylistGuard>);

    expect(screen.queryByText('Playlist Edit Content')).not.toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });
}); 