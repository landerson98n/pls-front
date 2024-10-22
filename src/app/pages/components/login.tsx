'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plane } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type LoginProps = {
    onLogin: (email: string, password: string) => void
}

export function Login({ onLogin }: LoginProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (email && password) {
            onLogin(email, password)
        } else {
            toast({
                title: "Erro",
                description: "Por favor, preencha todos os campos.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="min-h-screen bg-[#556B2F] flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex items-center justify-center mb-6">
                    <Plane className="w-12 h-12 text-[#556B2F]" />
                    <span className="text-3xl font-bold text-[#556B2F] ml-2">PLS</span>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Username</Label>
                        <Input
                            id="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <Button type="submit" className="w-full bg-[#556B2F] hover:bg-[#4B5320]">
                        Entrar
                    </Button>
                </form>
            </div>
        </div>
    )
}