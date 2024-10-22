'use client'

import React from 'react'
import { toast } from '@/hooks/use-toast'
import axios from 'axios'
import { Login } from '@/app/pages/components/login'
import { useRouter } from 'next/navigation'
export default function Dashboard() {
  const route = useRouter()
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/login', { email, password })

      if (response.status === 200) {
        localStorage.setItem('token', JSON.stringify(response.data))
        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo, ${response.data.user.name}!`,
        })
      }
      route.push('/pages/dashboard')
    } catch (error) {
      console.error('Erro de login:', error)

      toast({
        title: "Erro de autenticação",
        description: error.response?.data?.message || "Email ou senha incorretos.",
        variant: "destructive",
      })
    }
  }


  return (
    <Login onLogin={handleLogin} />
  )
}