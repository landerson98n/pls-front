import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Supondo que você tenha uma instância Prisma

export async function POST(request) {
    const { username, password, name, role } = await request.json();

    const existingUser = await prisma.user.findUnique({
        where: { username },
    });

    if (existingUser) {
        return NextResponse.json({ message: 'Username already exists' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
        data: {
            username,
            name,
            role,
            password: hashPassword(password), // Função de hash que você deve definir
        },
    });

    const token = createAccessToken({ name: newUser.name, id: newUser.id }); // Função de criação de token que você deve definir
    return NextResponse.json({ token, token_type: 'bearer' }, { status: 201 });
}
