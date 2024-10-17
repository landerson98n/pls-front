import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    const expenses = await prisma.expenses.findMany();

    const expensesData = expenses.map(expense => ({
        id: expense.id,
        data: expense.data, // Formatação da data
        origem: expense.origem,
        tipo: expense.tipo,
        descricao: expense.descricao,
        porcentagem: expense.porcentagem,
        valor: expense.valor,
        service_id: expense.service_id,

    }));

    return NextResponse.json(expensesData);
}

export async function PUT(req) {
    try {
        const data = await req.json();

        const {
            id, data: expenseDate, origem, tipo, descricao, porcentagem, valor, confirmacao_de_pagamento, funcionario_id
        } = data;

        const updatedExpense = await prisma.expenses.update({
            where: { id: parseInt(id) },
            data: {
                data: new Date(expenseDate),
                origem,
                tipo,
                descricao,
                porcentagem,
                valor,
                confirmacao_de_pagamento,
                employee_id: funcionario_id,
            },
        });

        return NextResponse.json(updatedExpense, { status: 200 });
    } catch (error) {
        console.error('Erro ao atualizar a despesa:', error);
        return NextResponse.json({ error: 'Erro ao atualizar a despesa' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();

        const {
            data: expenseDate, origem, tipo, descricao, porcentagem,
            service_id, valor_total_da_area, valor_da_comissao, valor, employee_id, aircraft_id
        } = data;

        let newExpense = {};

        if (origem === "Comissão do Funcionário") {
            newExpense = {
                data: new Date(expenseDate),
                origem,
                employee_id,
                porcentagem,
                service_id,
            };
        } else if (origem === "Despesa do Avião" || origem === "Despesa do Veículo" || origem === "Despesa Específica") {
            newExpense = {
                data: new Date(expenseDate),
                origem,
                aircraft_id,
                tipo,
                descricao,
                valor,
            };
        }

        const createdExpense = await prisma.expenses.create({
            data: {
                ...newExpense,
                aircraft_id: Number(newExpense.aircraft_id),
                employee_id: Number(newExpense.employee_id),
                service_id: Number(newExpense.service_id)
            },
        });

        return NextResponse.json({ message: "Expense created successfully", expense: createdExpense }, { status: 201 });
    } catch (error) {
        console.error('Erro ao criar despesa:', error);
        return NextResponse.json({ error: 'Erro ao criar a despesa' }, { status: 500 });
    }
}