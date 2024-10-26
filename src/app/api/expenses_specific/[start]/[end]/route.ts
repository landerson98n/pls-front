import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { format } from 'date-fns'

type Expense = {
    id: number
    data: Date
    origem: string
    tipo?: string
    descricao?: string
    valor: number
    confirmação_de_pagamento: string
    aircraft_name?: string
    porcentagem?: number
    employee_name?: string
    service_name?: string
}

export async function GET(req, { params }) {
    const { start, end } = params;
    const { searchParams } = new URL(req.url);
    const filtersJson = searchParams.get('dados')
    const dataFilter: { [key in keyof Expense]?: string } = await JSON.parse(filtersJson || '')

    const whereClause: any = {
        data: {
            gte: new Date(searchParams.get("inicio")?.toString() || ''),
            lte: new Date(searchParams.get("fim")?.toString() || ''),
        },
        origem: "Despesa Específica"
    };

    Object.entries(dataFilter).forEach(([key, value]) => {
        if (key === 'id' ||
            key === 'valor' ||
            key === 'porcentagem' ||
            key === 'service_name' ||
            key === 'data'
        ) {
            null
        }
        else if (key === 'employee_name' && value && value !== '') {
            whereClause['employees'] = {

                name: {
                    contains: value
                }

            }
        }
        else if (key === 'aircraft_name' && value && value !== '') {
            whereClause['aircraft'] = {

                OR: [
                    {
                        model: {
                            contains: value
                        }
                    },
                    {
                        brand:
                        {
                            contains: value
                        }
                    },
                    {
                        registration: {
                            contains: value
                        }
                    }
                ]

            }
        }
        else {
            if (value && value !== '') {
                whereClause[key] = { contains: value }
            }
        }

    });
    
    try {
        const expenses = await prisma.expenses.findMany({
            where: whereClause
        });
        

        const filteredServices = expenses.filter(service => {
            return Object.entries(dataFilter).every(([key, value]) => {
                if (key === 'id' ||
                    key === 'valor' ||
                    key === 'porcentagem'||
                    key === 'data'
                ) {
                    if (key === 'data') {
                        return format(`${service[key]}`, 'dd / MM / yyyy').toString().toLowerCase().includes(value.toString().toLowerCase())
                    } else {
                        return service[key].toString().toLowerCase().includes(value.toString().toLowerCase());
                    }
                }

                return true;
            });
        });

        const expensesData = await Promise.all(filteredServices.map(async (expense) => {
            const aircraft = await prisma.aircraft.findUnique({ where: { id: expense.aircraft_id } });
            return {
                id: expense.id,
                data: expense.data.toISOString().split('T')[0],
                origem: expense.origem,
                descricao: expense.descricao,
                valor: expense.valor,
                confirmação_de_pagamento: expense.confirma__o_de_pagamento,
                aircraft_name: aircraft ? `${aircraft.registration} - ${aircraft.model} - ${aircraft.brand}` : null,
                aircraft_id: expense.aircraft_id,
                employee_id: expense.employee_id
            };
        }));
        const paginatedData = expensesData.slice(start, end);        
        return NextResponse.json(paginatedData, { status: 200 });
    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        return NextResponse.json({ error: `Erro ao buscar serviços ${error}` }, { status: 500 });
    }
}




