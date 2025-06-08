import { useState, useEffect } from 'react'
import supabase from '../helper/supabaseClient'

export function useAuth() {
  const cachedUser = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  })();

  const [user, setUser] = useState(cachedUser)
  const [loading, setLoading] = useState(!cachedUser)

  useEffect(() => {
    if (!cachedUser) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        sessionStorage.setItem('user', JSON.stringify(session?.user ?? null))
        setLoading(false)
      })
    } else {
      setLoading(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      sessionStorage.setItem('user', JSON.stringify(session?.user ?? null))
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      sessionStorage.removeItem('user')
      console.log('Пользователь вышел из системы')
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    }
  }

  return { user, loading, signOut }
}
