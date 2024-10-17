import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    const { username, password } = await request.json();

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (user && verifyPassword(user.password, password)) { // Função de verificação que você deve definir
        const token = createAccessToken({ name: user.name, id: user.id });
        return NextResponse.json({ token, token_type: 'bearer' });
    }

    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
}
