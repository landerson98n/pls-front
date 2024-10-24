import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { format } from 'date-fns'

type Service = {
    id: number
    data_inicio: string
    data_final: string | null
    solicitante_da_area: string
    nome_da_area: string
    tamanho_area_hectares: number
    tamanho_area_alqueires: number
    tipo_aplicacao_na_area: string
    quantidade_no_hopper_por_voo: number
    tipo_de_vazao: string
    quantidade_de_voos_na_area: number
    valor_por_alqueire: number
    valor_por_hectare: number
    valor_medio_por_hora_de_voo: number
    valor_total_da_area: number
    confirmacao_de_pagamento_da_area: string
    tempo_de_voo_gasto_na_area: string
    aeronave_id: number
    aeronave_data: string
    employee_id: number
    employee_data: string
    lucro_por_area: number
    percentual_de_lucro_liquido_por_area: number
    criado_em: string
    criado_por: string
}

export async function GET(req, { params }) {
    const { start, end } = params;
    const { searchParams } = new URL(req.url);
    const filtersJson = searchParams.get('dados')
    const dataFilter: { [key in keyof Service]?: string } = await JSON.parse(filtersJson || '')

    const whereClause: any = {
        criado_em: {
            gte: new Date(searchParams.get('inicio')?.toString() || ''),
            lte: new Date(searchParams.get('fim')?.toString() || ''),
        }
    };

    Object.entries(dataFilter).forEach(([key, value]) => {
        if (key === 'id' ||
            key === 'tamanho_area_hectares' ||
            key === 'tamanho_area_alqueires' ||
            key === 'quantidade_no_hopper_por_voo' ||
            key === 'quantidade_de_voos_na_area' ||
            key === 'valor_por_alqueire' ||
            key === 'valor_por_hectare' ||
            key === 'valor_medio_por_hora_de_voo' ||
            key === 'valor_total_da_area' ||
            key === 'aeronave_id' ||
            key === 'employee_id' ||
            key === 'lucro_por_area' ||
            key === 'percentual_de_lucro_liquido_por_area' ||
            key === 'tipo_de_vazao' ||
            key === 'data_final' ||
            key === 'data_inicio'
        ) {
            null
        }
        else if (key === 'employee_data' && value && value !== '') {
            whereClause['employees'] = {

                name: {
                    contains: value
                }

            }
        }
        else if (key === 'criado_por' && value && value !== '') {
            whereClause['users'] = {

                name: {
                    contains: value
                }

            }
        }
        else if (key === 'aeronave_data' && value && value !== '') {
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
        const services = await prisma.services.findMany({
            include: {
                aircraft: true,
                employees: true,
            },
            skip: Number(start),
            take: Number(end - start),
            where: whereClause
        });


        const filteredServices = services.filter(service => {
            return Object.entries(dataFilter).every(([key, value]) => {
                if (key === 'id' ||
                    key === 'tamanho_area_hectares' ||
                    key === 'tamanho_area_alqueires' ||
                    key === 'quantidade_no_hopper_por_voo' ||
                    key === 'quantidade_de_voos_na_area' ||
                    key === 'valor_por_alqueire' ||
                    key === 'valor_por_hectare' ||
                    key === 'valor_medio_por_hora_de_voo' ||
                    key === 'valor_total_da_area' ||
                    key === 'aeronave_id' ||
                    key === 'employee_id' ||
                    key === 'lucro_por_area' ||
                    key === 'percentual_de_lucro_liquido_por_area' ||
                    key === 'tipo_de_vazao' ||
                    key === 'data_final' ||
                    key === 'data_inicio'
                ) {
                    if (key === 'data_final' || key === 'data_inicio') {
                        return format(`${service[key]}`, 'dd / MM / yyyy').toString().toLowerCase().includes(value.toString().toLowerCase())
                    } else {
                        return service[key].toString().toLowerCase().includes(value.toString().toLowerCase());
                    }
                }

                return true;
            });
        });

        const serviceData = await Promise.all(filteredServices.map(async (service) => {
            const user = await prisma.users.findFirst({
                where: {
                    id: service.criado_por
                }
            });

            return {
                id: service.id,
                data_inicio: service.data_inicio,
                data_final: service.data_final,
                solicitante_da_area: service.solicitante_da_area,
                nome_da_area: service.nome_da_area,
                tamanho_area_hectares: service.tamanho_area_hectares,
                tamanho_area_alqueires: service.tamanho_area_alqueires,
                tipo_aplicacao_na_area: service.tipo_aplicacao_na_area,
                quantidade_no_hopper_por_voo: service.quantidade_no_hopper_por_voo,
                tipo_de_vazao: service.tipo_de_vazao,
                quantidade_de_voos_na_area: service.quantidade_de_voos_na_area,
                valor_por_alqueire: service.valor_por_alqueire,
                valor_por_hectare: service.valor_por_hectare,
                valor_total_da_area: service.valor_total_da_area,
                confirmacao_de_pagamento_da_area: service.confirmacao_de_pagamento_da_area,
                tempo_de_voo_gasto_na_area: service.tempo_de_voo_gasto_na_area,
                aeronave_data: `${service.aircraft.registration} - ${service.aircraft.brand} - ${service.aircraft.model}`,
                employee_data: service.employees ? `${service.employees.name} - ${service.employees.role}` : 'Piloto não informado',
                criado_por: user.name,
                lucro_por_area: service.lucro_por_area,
                percentual_de_lucro_liquido_por_area: service.percentual_de_lucro_liquido_por_area,
                valor_medio_por_hora_de_voo: service.valor_medio_por_hora_de_voo,
                criado_em: service.criado_em
            }
        }));

        return NextResponse.json(serviceData, { status: 200 });
    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        return NextResponse.json({ error: `Erro ao buscar serviços ${error}` }, { status: 500 });
    }
}




