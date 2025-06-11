import { render, screen } from '@testing-library/react';
import { PlaylistTracks } from '../PlaylistTracks';

// Мокаем хелперы форматирования
jest.mock('../../../helper/formatters', () => ({
  formatDate: (date) => '01.01.2024',
  formatDurationMs: (ms) => '3:30'
}));

describe('PlaylistTracks Component', () => {
  const mockTracks = [
    {
      track: {
        id: '1',
        title: 'Test Track 1',
        cover: 'https://example.com/cover1.jpg',
        artists: [{ name: 'Artist 1' }],
        albums: [{ title: 'Album 1' }],
        created_at: '2024-01-01',
        durationMs: 210000
      }
    },
    {
      track: {
        id: '2',
        title: 'Test Track 2',
        cover: null,
        artists: [],
        albums: [],
        created_at: '2024-01-02',
        durationMs: 180000
      }
    }
  ];

  it('renders tracks table with headers', () => {
    render(<PlaylistTracks tracks={mockTracks} />);

    expect(screen.getByText('Треки')).toBeInTheDocument();
    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('Название')).toBeInTheDocument();
    expect(screen.getByText('Исполнитель')).toBeInTheDocument();
    expect(screen.getByText('Альбом')).toBeInTheDocument();
    expect(screen.getByText('Дата')).toBeInTheDocument();
    expect(screen.getByText('Длительность')).toBeInTheDocument();
  });

  it('renders tracks with complete information', () => {
    render(<PlaylistTracks tracks={mockTracks} />);

    // Проверяем первый трек
    expect(screen.getByText('Test Track 1')).toBeInTheDocument();
    expect(screen.getByText('Artist 1')).toBeInTheDocument();
    expect(screen.getByText('Album 1')).toBeInTheDocument();
    expect(screen.getByText('01.01.2024')).toBeInTheDocument();
    expect(screen.getByText('3:30')).toBeInTheDocument();

    // Проверяем изображение обложки
    const coverImage = screen.getByAltText('Обложка трека');
    expect(coverImage).toHaveAttribute('src', 'https://example.com/cover1.jpg');
  });

  it('renders tracks with missing information', () => {
    render(<PlaylistTracks tracks={mockTracks} />);

    // Проверяем второй трек
    expect(screen.getByText('Test Track 2')).toBeInTheDocument();
    expect(screen.getByText('Неизвестный исполнитель')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders correct track numbers', () => {
    render(<PlaylistTracks tracks={mockTracks} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders fallback icon when no cover is provided', () => {
    render(<PlaylistTracks tracks={mockTracks} />);

    const fallbackIcon = screen.getAllByRole('img', { name: /music/i });
    expect(fallbackIcon).toHaveLength(1); // Только для второго трека
  });

  it('renders empty state when no tracks provided', () => {
    render(<PlaylistTracks tracks={[]} />);

    expect(screen.getByText('Треки')).toBeInTheDocument();
    expect(screen.queryByRole('row')).not.toBeInTheDocument();
  });
}); 