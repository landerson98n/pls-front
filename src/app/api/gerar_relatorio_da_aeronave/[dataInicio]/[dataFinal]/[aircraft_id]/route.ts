import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    const { dataInicio, dataFinal, aircraft_id } = params;

    try {
        const startDate = new Date(dataInicio.split('_').reverse().join('-'));
        const endDate = new Date(dataFinal.split('_').reverse().join('-'));

        if (isNaN(startDate) || isNaN(endDate)) {
            return NextResponse.json({ error: 'Formato de data inválido. Use o formato dd_mm_aaaa.' }, { status: 400 });
        }

        const servicos_e_despesas = await prisma.services.findMany({
            where: {
                aeronave_id: parseInt(aircraft_id),
                criado_em: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                expenses: {
                    include: {
                        employees: true
                    }
                },

            },
        });


        if (!servicos_e_despesas.length) {
            return NextResponse.json({
                nome_aeronave: "Nenhum serviço encontrado para essa aeronave nas datas especificadas.",
                total_de_area_aplicada_em_hectares: 0,
                total_de_area_aplicada_em_alqueires: 0,
                valor_total_bruto_recebido: 0,
                valor_medio_de_hectares_total: 0,
                valor_medio_de_alqueires_total: 0,
                total_de_horas_voadas: 0,
                valor_medio_por_hora_de_voo_total: 0,
                lucro_total: 0,
                total_gasto_combustivel: 0,
                total_gasto_oleo: 0,
                comissoes_de_pilotos: 0,
                comissoes_de_badeco: 0,
                restante_das_despesas: 0,
                despesas_de_veiculo: 0,
                despesas_de_especificas: 0,
            });
        }

        // Buscar informações da aeronave
        const aircraft_info = await prisma.aircraft.findUnique({
            where: { id: parseInt(aircraft_id) },
        });

        if (!aircraft_info) {
            return NextResponse.json({ error: 'Aeronave não encontrada.' }, { status: 404 });
        }

        const nome_aeronave = `${aircraft_info.registration}-${aircraft_info.model}-${aircraft_info.brand}`;

        // Cálculos das áreas, valores brutos e despesas
        const total_area_hectares = servicos_e_despesas.reduce(
            (acc, servico) => acc + (Number(servico.tamanho_area_hectares) || 0), 0
        );

        const total_area_alqueires = (total_area_hectares / 4.84).toFixed(2);

        const valor_total_bruto = servicos_e_despesas.reduce(
            (acc, servico) => acc + (Number(servico.valor_total_da_area) || 0), 0
        );

        const valor_medio_hectares_total = (valor_total_bruto / total_area_hectares).toFixed(2);
        const valor_medio_alqueires_total = (valor_medio_hectares_total * 4.84).toFixed(2);

        const total_horas_voadas = servicos_e_despesas.reduce(
            (acc, servico) => acc + (Number(servico.tempo_de_voo_gasto_na_area) || 0), 0
        );

        const valor_medio_por_hora_de_voo_total = (valor_total_bruto / total_horas_voadas).toFixed(2);

        // Cálculo das despesas
        const despesas = servicos_e_despesas.flatMap(servico => servico.expenses);
        const total_gasto_combustivel = despesas.filter(d => d.tipo === 'Combustível').reduce((acc, d) => acc + Number(Number(d.valor)), 0);
        const total_gasto_oleo = despesas.filter(d => d.tipo === 'Óleo').reduce((acc, d) => acc + Number(d.valor), 0);
        const restante_das_despesas = despesas.filter(d => !['Combustível', 'Óleo'].includes(d.tipo)).reduce((acc, d) => acc + Number(d.valor), 0);
        const despesas_de_veiculo = despesas.filter(d => d.origem === 'Despesa do Veículo').reduce((acc, d) => acc + Number(d.valor), 0);
        const despesas_de_especificas = despesas.filter(d => d.origem === 'Despesa Específica').reduce((acc, d) => acc + Number(d.valor), 0);

        // Calcular as comissões dos pilotos e auxiliares de pista
        const comissoes_de_pilotos = despesas.filter(d => d.employees?.role === 'Piloto').reduce((acc, d) => acc + Number(d.valor), 0);
        const comissoes_de_badeco = despesas.filter(d => d.employees?.role === 'Auxiliar de pista').reduce((acc, d) => acc + Number(d.valor), 0);

        // Lucro total após deduzir as despesas
        let lucro_total = valor_total_bruto;
        lucro_total -= total_gasto_combustivel + total_gasto_oleo + restante_das_despesas + despesas_de_veiculo + despesas_de_especificas;

        return NextResponse.json({
            nome_aeronave,
            total_de_area_aplicada_em_hectares: Number(total_area_hectares).toFixed(2) || 0,
            total_de_area_aplicada_em_alqueires: total_area_alqueires,
            valor_total_bruto_recebido: Number(valor_total_bruto)?.toFixed(2) || 0,
            valor_medio_de_hectares_total: valor_medio_hectares_total,
            valor_medio_de_alqueires_total: valor_medio_alqueires_total,
            total_de_horas_voadas: Number(total_horas_voadas)?.toFixed(2) || 0,
            valor_medio_por_hora_de_voo_total: valor_medio_por_hora_de_voo_total,
            lucro_total: Number(lucro_total).toFixed(2) || 0,
            total_gasto_combustivel: Number(total_gasto_combustivel)?.toFixed(2) || 0,
            total_gasto_oleo: Number(total_gasto_oleo)?.toFixed(2) || 0,
            comissoes_de_pilotos: Number(comissoes_de_pilotos)?.toFixed(2) || 0,
            comissoes_de_badeco: Number(comissoes_de_badeco)?.toFixed(2) || 0,
            restante_das_despesas: Number(restante_das_despesas)?.toFixed(2) || 0,
            despesas_de_veiculo: Number(despesas_de_veiculo)?.toFixed(2) || 0,
            despesas_de_especificas: Number(despesas_de_especificas)?.toFixed(2) || 0
        });
    } catch (error) {
        return NextResponse.json({ error: `Erro ao processar os dados. Verifique as informações. ${error}` }, { status: 500 });
    }
}
