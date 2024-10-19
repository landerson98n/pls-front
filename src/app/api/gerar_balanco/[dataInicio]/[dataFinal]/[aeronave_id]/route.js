import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    const { dataInicio, dataFinal, aeronave_id } = params;
    console.log(params);

    try {
        const startDate = new Date(dataInicio.split('_').reverse().join('-'));
        const endDate = new Date(dataFinal.split('_').reverse().join('-'));

        const total_valor_area = await prisma.services.aggregate({
            _sum: {
                valor_total_da_area: true,
            },
            where: {
                data_inicio: {
                    gte: startDate,
                    lte: endDate,
                },
                aeronave_id: Number(aeronave_id)
            },
        });


        const total_despesas = await prisma.expenses.aggregate({
            _sum: {
                valor: true,
            },
            where: {
                data: {
                    gte: startDate,
                    lte: endDate,
                },
                aircraft_id: Number(aeronave_id)
            },
        });

        const total_combustivel_gasto_na_area = await prisma.expenses.aggregate({
            _sum: {
                valor: true,
            },
            where: {
                tipo: 'Combustível',
                data: {
                    gte: startDate,
                    lte: endDate,
                },
                aircraft_id: Number(aeronave_id)
            },
        });

        const total_de_oleo = await prisma.expenses.aggregate({
            _sum: {
                valor: true,
            },
            where: {
                tipo: 'Óleo',
                data: {
                    gte: startDate,
                    lte: endDate,
                },
                aircraft_id: Number(aeronave_id)
            },
        });

        const lucro_liquido = total_valor_area._sum.valor_total_da_area - total_despesas._sum.valor;

        return NextResponse.json({
            total_valor_area: total_valor_area._sum.valor_total_da_area,
            total_despesas: total_despesas._sum.valor,
            total_combustivel_gasto_na_area: total_combustivel_gasto_na_area._sum.valor,
            lucro_liquido: lucro_liquido > 0 ? lucro_liquido : 0,
            total_oleo_gasto: total_de_oleo._sum.valor,
        });
    } catch (error) {
        console.log(error);
        
        return NextResponse.json({ error: `Formato de data inválido. Use o formato dd_mm_aaaa. ${error}` }, { status: 400 });
    }
}
