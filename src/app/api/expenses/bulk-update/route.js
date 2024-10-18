import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req, res) {
    try {
        const { ids, field, value } = await req.json();  // Recebe os IDs das despesas, o campo e o valor

        if (!ids || ids.length === 0) {
            return NextResponse.json({ error: 'Nenhuma despesa selecionada para atualizar.' }, { status: 400 });
        }

        // Atualiza as despesas no banco de dados
        await prisma.expenses.updateMany({
            where: {
                id: { in: ids },  // Atualiza todas as despesas cujos IDs estão no array
            },
            data: {
                [field]: value,   // Atualiza o campo com o valor passado
            },
        });

        return NextResponse.json({ message: 'Despesas atualizadas com sucesso' }, { status: 200 });
    } catch (error) {
        console.error('Erro ao atualizar despesas em lote:', error);
        return NextResponse.json({ error: 'Erro ao atualizar despesas' }, { status: 500 });
    }
}
