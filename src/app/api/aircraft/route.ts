import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    const { registration, brand, model } = await request.json();

    const existingAircraft = await prisma.aircraft.findUnique({
        where: { registration },
    });

    if (existingAircraft) {
        return NextResponse.json({ error: 'Aeronave com registro já existe' }, { status: 400 });
    }

    const newAircraft = await prisma.aircraft.create({
        data: { registration, brand, model },
    });

    return NextResponse.json({ message: 'Aircraft created successfully' }, { status: 201 });
}

export async function DELETE(req) {
    try {
        const { id } = await req.json();


        await prisma.aircraft.delete({
            where: {
                id
            },
        });

        return NextResponse.json({ status: 204 });
    } catch (error) {
        console.error('Erro ao deletar aeronaves:', error);
        return NextResponse.json({ error: 'Erro ao deletar aeronaves' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const data = await req.json();

        const { id, registration, brand, model } = data

        if (!id || !registration || !brand || !model) {
            return NextResponse.json({ error: 'ID e dados atualizados são obrigatórios' }, { status: 400 });
        }

        await prisma.aircraft.update({
            where: { id },
            data: {
                registration,
                brand,
                model
            },
        });

        return NextResponse.json({ message: 'Aeronave atualizado com sucesso' }, { status: 200 });
    } catch (error) {
        console.error('Erro ao atualizar o Aeronave:', error);
        return NextResponse.json({ error: 'Erro ao atualizar o Aeronave' }, { status: 500 });
    }
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