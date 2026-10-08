import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseRangeParam } from '@/lib/dateRange';

export async function GET(request, { params }) {
    const { dataInicio, dataFinal, aircraft_id, employee_id } = params;

    const startDate = parseRangeParam(dataInicio);
    const endDate = parseRangeParam(dataFinal, true);
    if (!startDate || !endDate) {
        return NextResponse.json({ error: 'Formato de data inválido.' }, { status: 400 });
    }
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
