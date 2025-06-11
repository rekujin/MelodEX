import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImportModal from '../CreateModal';

// Мокаем fetch
global.fetch = jest.fn();

describe('ImportModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnImportSuccess = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onImportSuccess: mockOnImportSuccess
  };

  const mockPlaylistData = {
    title: 'Test Playlist',
    trackCount: 10,
    platform: 'yandex'
  };

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnImportSuccess.mockClear();
    fetch.mockClear();
  });

  it('renders when isOpen is true', () => {
    render(<ImportModal {...defaultProps} />);

    expect(screen.getByText('Импорт плейлиста')).toBeInTheDocument();
    expect(screen.getByText('Платформа')).toBeInTheDocument();
    expect(screen.getByText('Ссылка на плейлист')).toBeInTheDocument();
    expect(screen.getByText('Импортировать')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<ImportModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Импорт плейлиста')).not.toBeInTheDocument();
  });

  it('shows error when submitting empty URL', async () => {
    render(<ImportModal {...defaultProps} />);

    const importButton = screen.getByText('Импортировать');
    fireEvent.click(importButton);

    expect(screen.getByText('Введите ссылку на плейлист')).toBeInTheDocument();
  });

  it('handles successful playlist import', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ result: mockPlaylistData })
    });

    render(<ImportModal {...defaultProps} />);

    const urlInput = screen.getByPlaceholderText('Вставьте ссылку на плейлист');
    await userEvent.type(urlInput, 'https://example.com/playlist');

    const importButton = screen.getByText('Импортировать');
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(screen.getByText('Плейлист успешно загружен')).toBeInTheDocument();
      expect(screen.getByText('Test Playlist')).toBeInTheDocument();
      expect(screen.getByText('Треков: 10')).toBeInTheDocument();
    });
  });

  it('handles import error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ImportModal {...defaultProps} />);

    const urlInput = screen.getByPlaceholderText('Вставьте ссылку на плейлист');
    await userEvent.type(urlInput, 'https://example.com/playlist');

    const importButton = screen.getByText('Импортировать');
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(screen.getByText('Ошибка при загрузке плейлиста')).toBeInTheDocument();
    });
  });

  it('handles create action', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ result: mockPlaylistData })
    });

    render(<ImportModal {...defaultProps} />);

    // Импортируем плейлист
    const urlInput = screen.getByPlaceholderText('Вставьте ссылку на плейлист');
    await userEvent.type(urlInput, 'https://example.com/playlist');

    const importButton = screen.getByText('Импортировать');
    fireEvent.click(importButton);

    // Создаем плейлист
    await waitFor(() => {
      const createButton = screen.getByText('Создать');
      fireEvent.click(createButton);
    });

    expect(mockOnImportSuccess).toHaveBeenCalledWith({
      ...mockPlaylistData,
      platform: 'yandex',
      originalUrl: 'https://example.com/playlist'
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles back action after successful import', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ result: mockPlaylistData })
    });

    render(<ImportModal {...defaultProps} />);

    // Импортируем плейлист
    const urlInput = screen.getByPlaceholderText('Вставьте ссылку на плейлист');
    await userEvent.type(urlInput, 'https://example.com/playlist');

    const importButton = screen.getByText('Импортировать');
    fireEvent.click(importButton);

    // Возвращаемся назад
    await waitFor(() => {
      const backButton = screen.getByText('Назад');
      fireEvent.click(backButton);
    });

    expect(screen.getByText('Импортировать')).toBeInTheDocument();
  });

  it('changes platform selection', async () => {
    render(<ImportModal {...defaultProps} />);

    const platformSelect = screen.getByRole('combobox');
    await userEvent.selectOptions(platformSelect, 'spotify');

    expect(platformSelect).toHaveValue('spotify');
  });

  it('handles close action', () => {
    render(<ImportModal {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles empty playlist creation', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ result: { ...mockPlaylistData, trackCount: 0 } })
    });

    render(<ImportModal {...defaultProps} />);

    const urlInput = screen.getByPlaceholderText('Вставьте ссылку на плейлист');
    await userEvent.type(urlInput, 'https://example.com/playlist');

    const importButton = screen.getByText('Импортировать');
    fireEvent.click(importButton);

    await waitFor(() => {
      const createButton = screen.getByText('Создать');
      fireEvent.click(createButton);
    });

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnImportSuccess).not.toHaveBeenCalled();
  });
}); 