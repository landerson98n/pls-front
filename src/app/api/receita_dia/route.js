import prisma from '@/lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export default async function handler(req, res) {
    const today = new Date();
    const firstDayOfMonth = startOfMonth(today);
    const lastDayOfMonth = endOfMonth(today);

    try {
        const receitaPorDia = await prisma.services.groupBy({
            by: ['data_inicio'],
            _sum: {
                valor_total_da_area: true,
            },
            where: {
                criado_em: {
                    gte: firstDayOfMonth,
                    lte: lastDayOfMonth,
                },
            },
        });

        const formattedData = receitaPorDia.map((dia) => ({
            day: dia.data_inicio.getDate(),
            total_valor: dia._sum.valor_total_da_area,
        }));

        return res.status(200).json(formattedData);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar receita diária' });
    }
}
