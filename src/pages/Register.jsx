import React, { useState } from 'react'
import supabase from "../helper/supabaseClient"

function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const validatePassword = (pass) => {
    if (pass.length < 6) return "Пароль должен содержать 6 символов"
    if (!/\d/.test(pass)) return "Пароль должен содержать хотя бы одну цифру"
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    
    const passwordError = validatePassword(password)
    if (passwordError) {
      setMessage(passwordError)
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      setMessage("Account created! Please check your email for confirmation.")
      setEmail("")
      setPassword("")
    } catch (error) {
      let errorMessage = error.message
      if (error.message.includes("password")) {
        errorMessage = "Invalid password: " + error.message.split(" ").slice(3).join(" ")
      }
      setMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2>Registration</h2>

      {message && (
        <div style={{ 
          color: message.startsWith("Account") ? "green" : "red",
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email" 
          placeholder="Email"
          required
        />
        
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password" 
          placeholder="Password"
          required
        />

        <button 
          type="submit"
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? "Processing..." : "Create Account"}
        </button>
      </form>
    </div>
  )
}

export default Register