export const VALIDATION = {
  EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
  USERNAME_REGEX: /^[a-zA-Z0-9_]+$/,
  CYRILLIC_REGEX: /[а-яА-ЯёЁ]/,
  MIN_PASSWORD_LENGTH: 8,
  MIN_USERNAME_LENGTH: 3,
};

export const checkPasswordStrength = (password) => {
  if (!password) return 0;

  let score = 0;

  const length = password.length;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  if (length >= VALIDATION.MIN_PASSWORD_LENGTH) score++;
  if (hasLowercase) score++;
  if (hasUppercase) score++;
  if (hasNumber) score++;
  if (hasSpecialChar) score++;
  if (length >= 16) score++;

  return Math.min(score - 1, 4);
};

export const translateSupabaseError = (error) => {
  if (!error?.message) return "Произошла ошибка";

  const msg = error.message.toLowerCase();

  if (msg.includes("invalid login credentials"))
    return "Неверный email или пароль";
  if (msg.includes("email not confirmed"))
    return "Подтвердите email перед входом";
  if (msg.includes("invalid email")) 
    return "Некорректный email";
  if (msg.includes("email rate limit"))
    return "Слишком много попыток. Попробуйте позже.";
  if (msg.includes("user already registered") || msg.includes("user already exists"))
    return "Пользователь с таким email уже зарегистрирован";
  if (msg.includes("password should be at least"))
    return "Пароль слишком короткий";
  if (msg.includes("unable to validate email address: invalid format"))
    return "Некорректный формат email.";
  if (msg.includes('duplicate key value violates unique constraint "profiles_username_key"'))
    return "Имя пользователя уже занято.";
  if (msg.includes("database error saving new user"))
    return "Имя пользователя уже занято.";

  return error.message;
}; 