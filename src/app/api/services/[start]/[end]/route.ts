import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { start, end } = params;
    try {
        const services = await prisma.services.findMany({
            include: {
                aircraft: true,
                employees: true,
            },
            skip: Number(start),
            take: end - start
        });

        const serviceData = await Promise.all(services.map(async (service) => {
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




