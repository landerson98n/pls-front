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
        origem: "Comissão do Funcionário"
    };


    Object.entries(dataFilter).forEach(([key, value]) => {
        if (key === 'id' ||
            key === 'valor' ||
            key === 'porcentagem' ||
            key === 'data'
        ) {
            null
        }
        else if (key === 'service_name' && value && value !== '') {
            whereClause['services'] = {
                OR: [
                    {
                        solicitante_da_area: { contains: value }
                    },
                    {
                        id: { equals: Number(value) ? Number(value) : 0 }
                    },
                    {
                        nome_da_area: { contains: value }
                    }
                ]
            }
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
            where: whereClause,
            include: {
                employees: true,
                services: true
            }
        });



        const filteredServices = expenses.filter(service => {
            return Object.entries(dataFilter).every(([key, value]) => {
                if (key === 'id' ||
                    key === 'valor' ||
                    key === 'porcentagem' ||
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

        const expensesData = filteredServices.map(expense => {
            const service = expense.services;
            const employee = expense.employees;

            const serviceName = service
                ? `Id: ${service.id} | ${service.solicitante_da_area} | ${service.nome_da_area} de ${service.data_inicio?.toLocaleDateString('pt-BR')} até ${service.data_final?.toLocaleDateString('pt-BR')}`
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
                aircraft_id: service?.aeronave_id,
                employee_id: employee?.id
            };
        });

        const paginatedData = expensesData.slice(start, end);
        return NextResponse.json(paginatedData, { status: 200 });
    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        return NextResponse.json({ error: `Erro ao buscar serviços ${error}` }, { status: 500 });
    }
}




