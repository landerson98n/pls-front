import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    const expenses = await prisma.expenses.findMany({
        where: { origem: "Despesa Específica" },
    });

    const expensesData = await Promise.all(expenses.map(async (expense) => {
        const aircraft = await prisma.aircraft.findUnique({ where: { id: expense.aircraft_id } });
        return {
            id: expense.id,
            data: expense.data.toISOString().split('T')[0],
            origem: expense.origem,
            descricao: expense.descricao,
            valor: expense.valor,
            confirmação_de_pagamento: expense.confirma__o_de_pagamento,
            aircraft_name: aircraft ? `${aircraft.registration} - ${aircraft.model} - ${aircraft.brand}` : null,
            aeronave_id: aircraft ? aircraft.id : null,
        };
    }));

    return NextResponse.json(expensesData);
}
