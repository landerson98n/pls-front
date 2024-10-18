import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Certifique-se de que o Prisma está configurado corretamente

export async function GET(request, { params }) {
    const { dataInicio, dataFinal } = params;

    const startDate = new Date(dataInicio.split('_').reverse().join('-'));
    const endDate = new Date(dataFinal.split('_').reverse().join('-'));

    const results = await prisma.aircraft.findMany({
        where: {
            services: {
                some: {
                    data_inicio: {
                        gte: startDate,
                        lte: endDate,
                    }
                }
            }
        },
        select: {
            registration: true,
            services: {
                where: {
                    data_inicio: {
                        gte: startDate,
                        lte: endDate,
                    }
                },
                select: {
                    valor_total_da_area: true,
                },
            },
        },
    });

    const aircraft_services = results.map(aircraft => {
        const total_valor_total_da_area = aircraft.services.reduce((acc, service) => acc + (parseFloat(service.valor_total_da_area) || 0), 0);
        return {
            aircraft_name: aircraft.registration,
            total_valor_total_da_area,
        };
    });

    return NextResponse.json(aircraft_services);
}
