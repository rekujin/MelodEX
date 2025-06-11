import { render, screen, fireEvent, act } from '@testing-library/react';
import Toast from '../Toast';

describe('Toast Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    mockOnClose.mockClear();
  });

  it('renders with default props', () => {
    render(<Toast message="Test message" onClose={mockOnClose} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders with different types', () => {
    const { rerender } = render(
      <Toast message="Success message" type="success" onClose={mockOnClose} />
    );
    expect(screen.getByText('Success message')).toBeInTheDocument();

    rerender(<Toast message="Error message" type="error" onClose={mockOnClose} />);
    expect(screen.getByText('Error message')).toBeInTheDocument();

    rerender(<Toast message="Warning message" type="warning" onClose={mockOnClose} />);
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('calls onClose after duration', () => {
    render(<Toast message="Test message" onClose={mockOnClose} duration={1000} />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    render(<Toast message="Test message" onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    act(() => {
      jest.advanceTimersByTime(300); // Время анимации закрытия
    });

    expect(mockOnClose).toHaveBeenCalled();
  });
}); 