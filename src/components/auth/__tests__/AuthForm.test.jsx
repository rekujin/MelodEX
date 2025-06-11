import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthForm from '../AuthForm';

describe('AuthForm Component', () => {
  const mockFields = {
    email: {
      label: 'Email',
      type: 'email',
      placeholder: 'Введите email',
      validate: (value) => {
        if (!value) return 'Email обязателен';
        if (!value.includes('@')) return 'Некорректный email';
        return null;
      }
    },
    password: {
      label: 'Пароль',
      type: 'password',
      placeholder: 'Введите пароль',
      validate: (value) => {
        if (!value) return 'Пароль обязателен';
        if (value.length < 6) return 'Пароль должен быть не менее 6 символов';
        return null;
      }
    }
  };

  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders form with all fields', () => {
    render(
      <AuthForm
        title="Вход"
        fields={mockFields}
        onSubmit={mockOnSubmit}
        submitButtonText="Войти"
      />
    );

    expect(screen.getByText('Вход')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введите email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введите пароль')).toBeInTheDocument();
    expect(screen.getByText('Войти')).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(
      <AuthForm
        title="Вход"
        fields={mockFields}
        onSubmit={mockOnSubmit}
        submitButtonText="Войти"
      />
    );

    const submitButton = screen.getByText('Войти');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email обязателен')).toBeInTheDocument();
      expect(screen.getByText('Пароль обязателен')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    render(
      <AuthForm
        title="Вход"
        fields={mockFields}
        onSubmit={mockOnSubmit}
        submitButtonText="Войти"
      />
    );

    const emailInput = screen.getByPlaceholderText('Введите email');
    await userEvent.type(emailInput, 'invalid-email');

    const submitButton = screen.getByText('Войти');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Некорректный email')).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    render(
      <AuthForm
        title="Вход"
        fields={mockFields}
        onSubmit={mockOnSubmit}
        submitButtonText="Войти"
      />
    );

    const passwordInput = screen.getByPlaceholderText('Введите пароль');
    await userEvent.type(passwordInput, '12345');

    const submitButton = screen.getByText('Войти');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Пароль должен быть не менее 6 символов')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    render(
      <AuthForm
        title="Вход"
        fields={mockFields}
        onSubmit={mockOnSubmit}
        submitButtonText="Войти"
      />
    );

    const emailInput = screen.getByPlaceholderText('Введите email');
    const passwordInput = screen.getByPlaceholderText('Введите пароль');

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');

    const submitButton = screen.getByText('Войти');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('toggles password visibility', async () => {
    render(
      <AuthForm
        title="Вход"
        fields={mockFields}
        onSubmit={mockOnSubmit}
        submitButtonText="Войти"
      />
    );

    const passwordInput = screen.getByPlaceholderText('Введите пароль');
    const toggleButton = screen.getByRole('button', { name: /toggle password/i });

    await userEvent.type(passwordInput, 'password123');
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('displays loading state', () => {
    render(
      <AuthForm
        title="Вход"
        fields={mockFields}
        onSubmit={mockOnSubmit}
        submitButtonText="Войти"
        isLoading={true}
      />
    );

    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    expect(screen.getByText('Загрузка...')).toBeDisabled();
  });

  it('displays message when provided', () => {
    const message = {
      text: 'Успешный вход',
      type: 'success'
    };

    render(
      <AuthForm
        title="Вход"
        fields={mockFields}
        onSubmit={mockOnSubmit}
        submitButtonText="Войти"
        message={message}
      />
    );

    expect(screen.getByText('Успешный вход')).toBeInTheDocument();
  });
}); 