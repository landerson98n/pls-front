import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    const { dataInicio, dataFinal, aircraft_id, employee_id } = params;

    const startDate = new Date(dataInicio);
    let endDate = new Date(dataFinal);
    try {
        const expenses_results = await prisma.expenses.findMany({
            where: {
                employee_id: parseInt(employee_id),
                aircraft_id: parseInt(aircraft_id),
                data: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                data: true,
                valor: true,
            },
        });

        const expenses_data = expenses_results.map(expense => ({
            date: expense.data?.toLocaleDateString('pt-BR'),
            value: parseFloat(expense.valor) || 0.0,
        }));

        return NextResponse.json(expenses_data);
    } catch (error) {
        return NextResponse.json({ error: `Erro ao buscar despesas por categoria ${error}` }, { status: 500 });
    }

}
