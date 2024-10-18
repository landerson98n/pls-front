import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
export async function POST(request) {
    const { email, password } = await request.json();

    try {
        // Encontra o usuário no banco de dados
        const user = await prisma.users.findUnique({
            where: { username: email }
        })

        if (!user) {
            return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 401 })
        }

        // Verifica se a senha está correta
        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash)
        if (!isPasswordCorrect) {
            return NextResponse.json({ message: 'Senha incorreta' }, { status: 401 })
        }

        // Gera um token JWT
        const token = jwt.sign({ id: user.id }, `${process.env.NEXT_PUBLIC_TOKEN}`, {
            expiresIn: '1h'
        })

        return NextResponse.json({
            token,
            user: { id: user.id, name: user.name }
        }, { status: 200 })
    } catch (error) {
        console.error('Erro de autenticação:', error)
        return NextResponse.json({ message: 'Erro ao fazer login' }, { status: 500 })
    }
}
