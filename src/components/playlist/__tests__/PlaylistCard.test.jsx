import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PlaylistCard } from '../PlaylistCard';
import { playlistsApi } from '../../../api/playlists';

// Мокаем API
jest.mock('../../../api/playlists', () => ({
  playlistsApi: {
    togglePlaylistLike: jest.fn()
  }
}));

// Мокаем useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('PlaylistCard Component', () => {
  const mockPlaylist = {
    id: '1',
    title: 'Test Playlist',
    avatar_url: 'https://example.com/avatar.jpg',
    author: {
      username: 'testuser'
    },
    likes_count: 10,
    is_liked: false,
    track_count: 5
  };

  beforeEach(() => {
    mockNavigate.mockClear();
    playlistsApi.togglePlaylistLike.mockClear();
  });

  it('renders playlist information correctly', () => {
    renderWithRouter(<PlaylistCard playlist={mockPlaylist} />);

    expect(screen.getByText('Test Playlist')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5 треков')).toBeInTheDocument();
  });

  it('navigates to playlist page on click', () => {
    renderWithRouter(<PlaylistCard playlist={mockPlaylist} />);

    const card = screen.getByText('Test Playlist').closest('.playlists-card');
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith('/playlist/1');
  });

  it('navigates to user profile when clicking author name', () => {
    renderWithRouter(<PlaylistCard playlist={mockPlaylist} />);

    const authorName = screen.getByText('testuser');
    fireEvent.click(authorName);

    expect(mockNavigate).toHaveBeenCalledWith('/user/testuser');
  });

  it('handles like toggle successfully', async () => {
    const mockOnLikeToggle = jest.fn();
    playlistsApi.togglePlaylistLike.mockResolvedValueOnce({
      likes_count: 11,
      is_liked: true
    });

    renderWithRouter(
      <PlaylistCard 
        playlist={mockPlaylist} 
        onLikeToggle={mockOnLikeToggle}
      />
    );

    const likeButton = screen.getByRole('img', { name: /heart/i });
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(playlistsApi.togglePlaylistLike).toHaveBeenCalledWith('1');
      expect(mockOnLikeToggle).toHaveBeenCalledWith({
        ...mockPlaylist,
        likes_count: 11,
        is_liked: true
      });
    });
  });

  it('handles like toggle error', async () => {
    playlistsApi.togglePlaylistLike.mockRejectedValueOnce(new Error('API Error'));

    renderWithRouter(<PlaylistCard playlist={mockPlaylist} />);

    const likeButton = screen.getByRole('img', { name: /heart/i });
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // Возвращается к исходному значению
    });
  });

  it('shows fallback icon when no avatar is provided', () => {
    const playlistWithoutAvatar = {
      ...mockPlaylist,
      avatar_url: null
    };

    renderWithRouter(<PlaylistCard playlist={playlistWithoutAvatar} />);
    expect(screen.getByRole('img', { name: /music/i })).toBeInTheDocument();
  });

  it('shows unknown author when author is not provided', () => {
    const playlistWithoutAuthor = {
      ...mockPlaylist,
      author: null
    };

    renderWithRouter(<PlaylistCard playlist={playlistWithoutAuthor} />);
    expect(screen.getByText('Неизвестный автор')).toBeInTheDocument();
  });
}); 