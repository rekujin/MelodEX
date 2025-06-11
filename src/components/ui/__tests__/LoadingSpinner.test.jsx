import { render } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders with default size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('spinner-default');
  });

  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="small" />);
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('spinner-small');
  });

  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="large" />);
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('spinner-large');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('custom-class');
  });
}); 