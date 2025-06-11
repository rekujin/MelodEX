import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PlaylistHeader } from '../PlaylistHeader';
import { playlistsApi } from '../../../api/playlists';
import { useAuth } from '../../../hooks/useAuth';

// Мокаем API
jest.mock('../../../api/playlists', () => ({
  playlistsApi: {
    deletePlaylist: jest.fn()
  }
}));

// Мокаем useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Мокаем useAuth
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

// Мокаем хелперы форматирования
jest.mock('../../../helper/formatters', () => ({
  formatDate: (date) => '01.01.2024',
  getPlatformColorClass: (platform) => 'yandex',
  getPlatformName: (platform) => 'Яндекс.Музыка'
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('PlaylistHeader Component', () => {
  const mockPlaylist = {
    id: '1',
    title: 'Test Playlist',
    description: 'Test Description'.repeat(10), // Длинное описание
    avatar_url: 'https://example.com/avatar.jpg',
    platform: 'yandex',
    created_at: '2024-01-01',
    tracks: [{ id: 1 }, { id: 2 }],
    author: {
      id: 'user1',
      username: 'testuser'
    },
    author_id: 'user1',
    tags: ['rock', 'pop'],
    playlist_url: 'https://example.com/playlist'
  };

  const mockOnBack = jest.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockOnBack.mockClear();
    playlistsApi.deletePlaylist.mockClear();
    useAuth.mockReturnValue({ user: { id: 'user1' } });
  });

  it('renders playlist information correctly', () => {
    renderWithRouter(<PlaylistHeader playlist={mockPlaylist} onBack={mockOnBack} />);

    expect(screen.getByText('Test Playlist')).toBeInTheDocument();
    expect(screen.getByText('Яндекс.Музыка')).toBeInTheDocument();
    expect(screen.getByText('2 треков')).toBeInTheDocument();
    expect(screen.getByText('01.01.2024')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('handles back button click', () => {
    renderWithRouter(<PlaylistHeader playlist={mockPlaylist} onBack={mockOnBack} />);

    const backButton = screen.getByText('Назад');
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('handles description expansion', () => {
    renderWithRouter(<PlaylistHeader playlist={mockPlaylist} onBack={mockOnBack} />);

    const expandButton = screen.getByText('Показать');
    fireEvent.click(expandButton);

    expect(screen.getByText('Скрыть')).toBeInTheDocument();
  });

  it('renders tags correctly', () => {
    renderWithRouter(<PlaylistHeader playlist={mockPlaylist} onBack={mockOnBack} />);

    expect(screen.getByText('rock')).toBeInTheDocument();
    expect(screen.getByText('pop')).toBeInTheDocument();
  });

  it('handles edit button click', () => {
    renderWithRouter(<PlaylistHeader playlist={mockPlaylist} onBack={mockOnBack} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/playlists/edit', {
      state: { playlistData: mockPlaylist }
    });
  });

  it('handles delete confirmation', async () => {
    playlistsApi.deletePlaylist.mockResolvedValueOnce();

    renderWithRouter(<PlaylistHeader playlist={mockPlaylist} onBack={mockOnBack} />);

    const deleteButton = screen.getByRole('button', { name: /trash/i });
    fireEvent.click(deleteButton);

    // Подтверждаем удаление
    const confirmButton = screen.getByText('Удалить');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(playlistsApi.deletePlaylist).toHaveBeenCalledWith('1');
      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  it('handles delete error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
    playlistsApi.deletePlaylist.mockRejectedValueOnce(new Error('Delete failed'));

    renderWithRouter(<PlaylistHeader playlist={mockPlaylist} onBack={mockOnBack} />);

    const deleteButton = screen.getByRole('button', { name: /trash/i });
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByText('Удалить');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Не удалось удалить плейлист');
    });

    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('handles open original playlist', () => {
    const windowSpy = jest.spyOn(window, 'open').mockImplementation();
    
    renderWithRouter(<PlaylistHeader playlist={mockPlaylist} onBack={mockOnBack} />);

    const openButton = screen.getByRole('button', { name: /external/i });
    fireEvent.click(openButton);

    expect(windowSpy).toHaveBeenCalledWith('https://example.com/playlist', '_blank');
    
    windowSpy.mockRestore();
  });

  it('does not show action buttons for non-author', () => {
    useAuth.mockReturnValue({ user: { id: 'different-user' } });

    renderWithRouter(<PlaylistHeader playlist={mockPlaylist} onBack={mockOnBack} />);

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /trash/i })).not.toBeInTheDocument();
  });

  it('shows fallback icon when no avatar is provided', () => {
    const playlistWithoutAvatar = {
      ...mockPlaylist,
      avatar_url: null
    };

    renderWithRouter(<PlaylistHeader playlist={playlistWithoutAvatar} onBack={mockOnBack} />);
    expect(screen.getByRole('img', { name: /music/i })).toBeInTheDocument();
  });
}); 