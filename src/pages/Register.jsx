import { useState } from 'react'
import './Register.css'
import supabase from "../helper/supabaseClient"

const translateSupabaseError = (error) => {
  if (!error?.message) return 'Произошла ошибка при регистрации'
  
  const msg = error.message.toLowerCase()
  
  if (msg.includes('user already registered') || msg.includes('user already exists'))
    return 'Пользователь с таким email уже зарегистрирован'
  if (msg.includes('invalid email'))
    return 'Некорректный email'
  if (msg.includes('password should be at least'))
    return 'Пароль слишком короткий'
  if (msg.includes('email rate limit'))
    return 'Слишком много попыток. Попробуйте позже.'
  if (msg.includes('unable to validate email address: invalid format'))
    return 'Некорректный формат email.'
  if (msg.includes('duplicate key value violates unique constraint "profiles_username_key"'))
    return 'Имя пользователя уже занято.'
  if (msg.includes('database error saving new user'))
    return 'Имя пользователя уже занято.'
    
  return error.message
}

const VALIDATION = {
  EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD_REGEX: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  USERNAME_REGEX: /^[a-zA-Z0-9_]+$/,
  CYRILLIC_REGEX: /[а-яА-ЯёЁ]/,
  MIN_PASSWORD_LENGTH: 8,
  MIN_USERNAME_LENGTH: 3,
}

const checkPasswordStrength = (password) => {
  if (!password) return 0;

  const hasMinLength = password.length >= VALIDATION.MIN_PASSWORD_LENGTH;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  // Базовые требования, чтобы пройти валидацию
  if (!hasMinLength || !(hasLowercase || hasUppercase) || !hasNumber) return 0;

  let strength = 1; // Дефф сила

  // Дополнительные баллы за улучшения
  if (password.length >= 12) strength += 1;        // +1 за длину
  if (hasUppercase) strength += 1;                 // +1 за заглавные
  if (hasSpecialChar) strength += 1;               // +1 за спецсимволы
  if (hasLowercase && hasUppercase) strength += 1; // +1 за смешанный регистр

  // Макс 4 балла
  return Math.min(strength, 4);
};

const FIELDS = {
  email: {
    label: 'Email',
    type: 'email',
    placeholder: 'example@mail.com',
    validate: (val) => {
      if (!val) return 'Введите email'
      if (VALIDATION.CYRILLIC_REGEX.test(val)) return 'Email не может содержать русские символы'
      if (!VALIDATION.EMAIL_REGEX.test(val)) return 'Некорректный формат email'
      return null
    }
  },
  username: {
    label: 'Имя пользователя',
    type: 'text',
    placeholder: 'username',
    validate: (val) => {
      if (!val) return 'Введите имя пользователя'
      if (val.length < VALIDATION.MIN_USERNAME_LENGTH) 
        return `Имя пользователя должно содержать минимум ${VALIDATION.MIN_USERNAME_LENGTH} символа`
      if (!VALIDATION.USERNAME_REGEX.test(val)) 
        return 'Имя пользователя может содержать только латинские буквы, цифры и знаки подчёркивания'
      return null
    }
  },
  password: {
    label: 'Пароль',
    type: 'password',
    placeholder: 'Не менее 8 символов',
    validate: (val) => {
      if (!val) return 'Введите пароль'
      if (VALIDATION.CYRILLIC_REGEX.test(val)) return 'Пароль не может содержать русские символы'
      if (!VALIDATION.PASSWORD_REGEX.test(val)) 
        return 'Пароль должен содержать минимум 8 символов, включая буквы и цифры'
      return null
    }
  }
}

function Register() {
  const [formData, setFormData] = useState({ email: '', username: '', password: '' })
  const [message, setMessage] = useState({ text: '', type: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const handleInputChange = (field, value) => {
    if (field !== 'username' && VALIDATION.CYRILLIC_REGEX.test(value)) return
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'password') {
      setPasswordStrength(checkPasswordStrength(value))
    }
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const errors = {}
    let hasErrors = false
    
    for (const field of Object.keys(FIELDS)) {
      const error = FIELDS[field].validate(formData[field])
      if (error) {
        errors[field] = error
        hasErrors = true
      }
    }
    
    if (hasErrors) {
      setFieldErrors(errors)

      const firstErrorField = Object.keys(errors).find(field => errors[field])
      setMessage({ text: errors[firstErrorField], type: 'error' })
      return
    }

    setIsLoading(true)
    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { username: formData.username } }
      })

      if (signUpError) throw signUpError

      setMessage({
        text: 'Аккаунт создан! Проверьте почту для подтверждения.',
        type: 'success'
      })
      setFormData({ email: '', username: '', password: '' })
      setFieldErrors({})
    } catch (error) {
      setMessage({
        text: translateSupabaseError(error) || 'Произошла ошибка при регистрации',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <h2>Регистрация</h2>
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        {Object.entries(FIELDS).map(([field, config]) => (
          <div className="form-group" key={field}>
            <div className="input-wrapper">
              <input
                id={field}
                type={field === 'password' ? (showPassword ? 'text' : 'password') : config.type}
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={config.placeholder}
                className={fieldErrors[field] ? 'input-error' : ''}
              />
              <label htmlFor={field}>{config.label}</label>
              {field === 'password' && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? '🔒' : '👁️'}
                </button>
              )}
            </div>
            {field === 'password' && formData.password && (
              <div className="password-strength">
                <div className={`strength-bar strength-${passwordStrength}`} />
                <span>Сложность пароля: {['Слабый', 'Средний', 'Хороший', 'Сильный'][passwordStrength-1] || 'Очень слабый'}</span>
              </div>
            )}
          </div>
        ))}
        <button
          type="submit"
          disabled={isLoading}
          className="submit-btn"
        >
          {isLoading ? "Отправка..." : "Зарегистрироваться"}
        </button>
      </form>
    </div>
  )
}

export default Register