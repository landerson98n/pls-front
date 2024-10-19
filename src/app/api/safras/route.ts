import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const safras = await prisma.safras.findMany();

        return NextResponse.json(safras, { status: 200 });
    } catch (error) {
        console.error('Erro ao buscar :', error);
        return NextResponse.json({ error: `Erro ao buscar safras ${error}` }, { status: 500 });
    }
}

export async function POST(req) {

    try {
        const body = await req.json();

        const {
            dataInicio, dataFinal, label
        } = body;

        await prisma.safras.create({
            data: {
                dataInicio: new Date(dataInicio),
                dataFinal: new Date(dataFinal),
                label
            }
        });

        return NextResponse.json({ message: "Safra criada" }, { status: 200 });
    } catch (error) {
        console.error('Erro ao criar serviço:', error);
        return NextResponse.json({ error: 'Erro ao criar safra' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { id } = await req.json();


        await prisma.safras.delete({
            where: {
                id
            },
        });

        return NextResponse.json({ status: 204 });
    } catch (error) {
        console.error('Erro ao deletar safras:', error);
        return NextResponse.json({ error: 'Erro ao deletar safras' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const data = await req.json();

        const { id, dataFinal, dataInicio, label } = data

        if (!id || !dataFinal || !dataInicio) {
            return NextResponse.json({ error: 'ID e dados atualizados são obrigatórios' }, { status: 400 });
        }

        await prisma.safras.update({
            where: { id },
            data: {
                dataFinal: new Date(dataFinal),
                dataInicio: new Date(dataInicio),
                label
            },
        });

        return NextResponse.json({ message: 'Serviço atualizado com sucesso' }, { status: 200 });
    } catch (error) {
        console.error('Erro ao atualizar o serviço:', error);
        return NextResponse.json({ error: 'Erro ao atualizar o serviço' }, { status: 500 });
    }
}

