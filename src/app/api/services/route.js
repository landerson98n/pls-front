import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const services = await prisma.services.findMany({
            include: {
                aircraft: true,
                employees: true,
            }
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
                valor_medio_por_hora_de_voo: service.valor_medio_por_hora_de_voo
            }
        }));        

        return NextResponse.json(serviceData, { status: 200 });
    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        return NextResponse.json({ error: `Erro ao buscar serviços ${error}` }, { status: 500 });
    }
}

export async function POST(req) {

    try {
        const body = await req.json();

        const {
            data_inicio, data_final, solicitante_da_area, nome_da_area,
            tamanho_area_hectares, tamanho_area_alqueires, tipo_aplicacao_na_area,
            quantidade_no_hopper_por_voo, tipo_de_vazao, quantidade_de_voos_na_area,
            valor_por_alqueire, valor_por_hectare, valor_total_da_area,
            confirmacao_de_pagamento_da_area, tempo_de_voo_gasto_na_area,
            aeronave_id, employee_id, criado_por, porcentagem_da_comissão,
            comissão_do_piloto, confirmacao_de_pagamento_do_piloto, despesas
        } = body;

        // Criar o novo serviço
        const newService = await prisma.services.create({
            data: {
                data_inicio: new Date(data_inicio),
                data_final: new Date(data_final),
                solicitante_da_area,
                nome_da_area,
                tamanho_area_hectares,
                tamanho_area_alqueires,
                tipo_aplicacao_na_area,
                quantidade_no_hopper_por_voo: String(quantidade_no_hopper_por_voo), // Convertendo para string                tipo_de_vazao,
                quantidade_de_voos_na_area,
                valor_total_da_area,
                confirmacao_de_pagamento_da_area,
                tempo_de_voo_gasto_na_area,
                aeronave_id: Number(aeronave_id),
                employee_id: Number(employee_id),
                criado_por
            }
        });

        // Criar a comissão do piloto
        await prisma.expenses.create({
            data: {
                origem: 'Comissão do Funcionário',
                porcentagem: porcentagem_da_comissão,
                valor: comissão_do_piloto,
                services: {
                    connect: {
                        id: newService.id
                    }
                },
                employees: {
                    connect: {
                        id: Number(employee_id)
                    }
                },
                confirma__o_de_pagamento: confirmacao_de_pagamento_do_piloto
            }
        });

        return NextResponse.json({ message: "Service and expenses created successfully" }, { status: 201 });
    } catch (error) {
        console.error('Erro ao criar serviço:', error);
        return NextResponse.json({ error: 'Erro ao criar serviço' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { ids } = await req.json();

        if (!ids || ids.length === 0) {
            return NextResponse.json({ error: 'Nenhum serviço selecionado para deletar.' }, { status: 400 });
        }

        // Deleta as despesas associadas aos serviços
        await prisma.expenses.deleteMany({
            where: {
                service_id: { in: ids },
            },
        });

        // Deleta os serviços
        await prisma.services.deleteMany({
            where: {
                id: { in: ids },
            },
        });

        return NextResponse.json({ status: 204 });
    } catch (error) {
        console.error('Erro ao deletar serviços:', error);
        return NextResponse.json({ error: 'Erro ao deletar serviços' }, { status: 500 });
    }
}

export async function PUT(req, res) {
    try {
        const data = await req.json();
        const { id, updatedData } = data.data
        delete updatedData.id
        delete updatedData.aeronave_data
        delete updatedData.employee_data

        if (!id || !updatedData) {
            return NextResponse.json({ error: 'ID e dados atualizados são obrigatórios' }, { status: 400 });
        }

        const updatedService = await prisma.services.update({
            where: { id: Number(id) },
            data: {
                ...updatedData,
                data_inicio: new Date(updatedData.data_inicio),
                data_final: updatedData.data_final ? new Date(updatedData.data_final) : null,
            },
        });

        return NextResponse.json({ status: 200 }, { message: 'Serviço atualizado com sucesso', updatedService });
    } catch (error) {
        console.error('Erro ao atualizar o serviço:', error);
        return NextResponse.json({ error: 'Erro ao atualizar o serviço' }, { status: 500 });
    }
}

