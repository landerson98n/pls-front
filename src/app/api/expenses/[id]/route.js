import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Caminho para a configuração do Prisma

export async function GET(req, { params }) {
    const { id } = params; // Obtém o service_id dos parâmetros da URL

    try {
        // Consulta as despesas relacionadas à comissão de funcionários
        const expenses = await prisma.expenses.findMany({
            where: {
                service_id: parseInt(id),
                origem: "Comissão do Funcionário",
            },
            include: {
                employee: true, // Inclui os dados do funcionário relacionado
            },
        });

        // Verifica se encontrou despesas
        if (!expenses || expenses.length === 0) {
            return NextResponse.json({ error: 'O serviço não foi encontrado' }, { status: 404 });
        }

        // Formata os dados da mesma forma que fazia no Flask
        const expensesData = expenses.map(expense => ({
            id: expense.id,
            data: new Date(expense.data).toLocaleDateString('pt-BR'),
            origem: expense.origem,
            tipo: expense.tipo,
            descricao: expense.descricao,
            porcentagem: expense.porcentagem,
            valor: expense.valor,
            confirmacao_de_pagamento: expense.confirmacao_de_pagamento,
            nome_funcionario: `${expense.employee.name}-${expense.employee.role}`,
            funcionario_id: expense.employee.id,
        }));

        // Retorna os dados formatados
        return NextResponse.json(expensesData);
    } catch (error) {
        console.error('Erro ao buscar despesas:', error);
        return NextResponse.json({ error: 'Erro ao buscar despesas' }, { status: 500 });
    }
}


export async function DELETE(req, { params }) {
    const { expense_id } = params;

    try {
        // Busca a despesa no banco de dados
        const expense = await prisma.expenses.findUnique({
            where: { id: parseInt(expense_id) }
        });

        if (!expense) {
            return NextResponse.json({ error: "A despesa não foi encontrada" }, { status: 404 });
        }

        // Deleta a despesa encontrada
        await prisma.expenses.delete({
            where: { id: parseInt(expense_id) }
        });

        return NextResponse.json({}, { status: 204 }); // Retorna status 204 (No Content)
    } catch (error) {
        console.error('Erro ao deletar despesa:', error);
        return NextResponse.json({ error: 'Erro ao deletar a despesa' }, { status: 500 });
    }
}
