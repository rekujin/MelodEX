import { useState } from 'react'
import './Login.css'
import supabase from "../helper/supabaseClient"

const translateSupabaseError = (error) => {
  if (!error?.message) return 'Произошла ошибка при входе'
  
  const msg = error.message.toLowerCase()
  
  if (msg.includes('invalid login credentials') || msg.includes('invalid email or password'))
    return 'Неверный email или пароль'
  if (msg.includes('invalid email'))
    return 'Некорректный email'
  if (msg.includes('email rate limit'))
    return 'Слишком много попыток. Попробуйте позже.'
  if (msg.includes('email not confirmed'))
    return 'Email не подтвержден. Проверьте вашу почту.'
  if (msg.includes('too many requests'))
    return 'Слишком много попыток входа. Попробуйте позже.'
    
  return error.message
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const CYRILLIC_REGEX = /[а-яА-ЯёЁ]/

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
  password: {
    label: 'Пароль',
    type: 'password',
    placeholder: 'Введите пароль',
    validate: (val) => {
      if (!val) return 'Введите пароль'
      return null
    }
  }
}

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [message, setMessage] = useState({ text: '', type: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleInputChange = (field, value) => {
    if (field !== 'password' && CYRILLIC_REGEX.test(value)) return
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
      const { error, data } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) throw error

      setMessage({
        text: 'Вход выполнен успешно!',
        type: 'success'
      })
      
      // Здесь можно добавить редирект на главную страницу или панель управления
      // например, window.location.href = '/dashboard'
      
    } catch (error) {
      setMessage({
        text: translateSupabaseError(error) || 'Произошла ошибка при входе',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    const email = formData.email
    
    if (!email || !EMAIL_REGEX.test(email)) {
      setMessage({
        text: 'Укажите корректный email для восстановления пароля',
        type: 'error'
      })
      return
    }
    
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) throw error
      
      setMessage({
        text: 'Инструкции по сбросу пароля отправлены на вашу почту',
        type: 'success'
      })
    } catch (error) {
      setMessage({
        text: translateSupabaseError(error) || 'Ошибка при отправке сброса пароля',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <h2>Вход в аккаунт</h2>
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
          {isLoading ? "Проверка..." : "Войти"}
        </button>
      </form>
      <div className="forgot-password">
        <button 
          onClick={handleResetPassword} 
          disabled={isLoading} 
          className="reset-btn"
        >
          Забыли пароль?
        </button>
      </div>
    </div>
  )
}

export default Login