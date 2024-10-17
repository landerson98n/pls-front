import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    const { registration, brand, model } = await request.json();

    const existingAircraft = await prisma.aircraft.findUnique({
        where: { registration },
    });

    if (existingAircraft) {
        return NextResponse.json({ error: 'Aircraft with this registration already exists' }, { status: 400 });
    }

    const newAircraft = await prisma.aircraft.create({
        data: { registration, brand, model },
    });

    return NextResponse.json({ message: 'Aircraft created successfully' }, { status: 201 });
}

export async function GET() {
    try {
        const aircrafts = await prisma.aircraft.findMany({
            select: {
                id: true,
                registration: true,
                brand: true,
                model: true
            }
        });
        
        return NextResponse.json(aircrafts, { status: 200 });
    } catch (error) {
        console.error('Erro ao buscar aeronaves:', error);
        return NextResponse.json({ error: 'Erro ao buscar aeronaves' }, { status: 500 });
    }
}