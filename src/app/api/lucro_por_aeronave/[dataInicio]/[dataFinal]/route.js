import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    const { dataInicio, dataFinal } = params;

    const startDate = new Date(dataInicio.split('_').reverse().join('-'));
    const endDate = new Date(dataFinal.split('_').reverse().join('-'));

    const results = await prisma.aircraft.findMany({
        where: {
            services: {
                some: {
                    criado_em: {
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
                    criado_em: {
                        gte: startDate,
                        lte: endDate,
                    }
                },
                select: {
                    lucro_por_area: true,
                },
            },
        },
    });

    const aircraft_services = results.map(aircraft => {
        const lucro_por_area = aircraft.services.reduce((acc, service) => acc + (parseFloat(service.lucro_por_area) || 0), 0);
        return {
            aircraft_name: aircraft.registration,
            lucro_por_area,
        };
    });

    return NextResponse.json(aircraft_services);
}
