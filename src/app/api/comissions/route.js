import prisma from '@/lib/prisma'; // Importa a instância do Prisma
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const expenses = await prisma.expenses.findMany({
            where: {
                origem: "Comissão do Funcionário",
            },
            include: {
                services: true, // Inclui a relação com o serviço
                employees: true, // Inclui a relação com o funcionário
            },
        });

        const expensesData = expenses.map(expense => {
            const service = expense.services;
            const employee = expense.employees;

            const serviceName = service
                ? `Id: ${service.id} | ${service.solicitante_da_area} | ${service.nome_da_area} de ${service.data_inicio.toLocaleDateString('pt-BR')} até ${service.data_final.toLocaleDateString('pt-BR')}`
                : 'Serviço não registrado';

            const employeeName = employee
                ? `${employee.name} - ${employee.role}`
                : 'Funcionário não registrado';

            return {
                id: expense.id,
                data: expense.data,
                origem: expense.origem,
                tipo: expense.tipo,
                descricao: expense.descricao,
                porcentagem: expense.porcentagem,
                valor: expense.valor,
                confirmação_de_pagamento: expense.confirma__o_de_pagamento,
                service_name: serviceName,
                employee_name: employeeName,
            };
        });

        return NextResponse.json(expensesData, { status: 200 });
    } catch (error) {
        console.error('Erro ao buscar comissões:', error);
        return NextResponse.json({ error: 'Erro ao buscar comissões' });
    }
} 
