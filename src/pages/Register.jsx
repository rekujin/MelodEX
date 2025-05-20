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

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const MIN_PASSWORD_LENGTH = 8
const CYRILLIC_REGEX = /[а-яА-ЯёЁ]/
const MIN_USERNAME_LENGTH = 3
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/

const FIELDS = {
  email: {
    label: 'Email',
    type: 'email',
    placeholder: 'example@mail.com',
    validate: (val) => {
      if (!val) return 'Введите email'
      if (CYRILLIC_REGEX.test(val)) return 'Email не может содержать русские символы'
      if (!EMAIL_REGEX.test(val)) return 'Некорректный формат email'
      return null
    }
  },
  username: {
    label: 'Имя пользователя',
    type: 'text',
    placeholder: 'Имя пользователя',
    validate: (val) => {
      if (!val) return 'Введите имя пользователя'
      if (val.length < MIN_USERNAME_LENGTH) return `Имя пользователя должно содержать минимум ${MIN_USERNAME_LENGTH} символа`
      if (!USERNAME_REGEX.test(val)) return 'Имя пользователя не может содержать русские символы'
      return null
    }
  },
  password: {
    label: 'Пароль',
    type: 'password',
    placeholder: 'Не менее 8 символов',
    validate: (val) => {
      if (!val) return 'Введите пароль'
      if (CYRILLIC_REGEX.test(val)) return 'Пароль не может содержать русские символы'
      if (val.length < MIN_PASSWORD_LENGTH) return `Пароль должен содержать ${MIN_PASSWORD_LENGTH} символов`
      if (!/\d/.test(val)) return 'Пароль должен содержать хотя бы одну цифру'
      if (!/[a-zA-Z]/.test(val)) return 'Добавьте хотя бы одну латинскую букву'
      return null
    }
  }
}

function Register() {
  const [formData, setFormData] = useState({ email: '', username: '', password: '' })
  const [message, setMessage] = useState({ text: '', type: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleInputChange = (field, value) => {
    if (field !== 'username' && CYRILLIC_REGEX.test(value)) return
    setFormData(prev => ({ ...prev, [field]: value }))
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

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username: formData.username })
        .eq('id', data.user.id)

      if (profileError) throw profileError

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
            <label htmlFor={field}>{config.label}:</label>
            <input
              id={field}
              type={config.type}
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder={config.placeholder}
              className={fieldErrors[field] ? 'input-error' : ''}
            />
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