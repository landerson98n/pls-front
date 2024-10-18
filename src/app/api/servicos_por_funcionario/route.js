import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const today = new Date();
            const currentMonth = today.getMonth() + 1;

            const results = await prisma.employees.findMany({
                select: {
                    name: true,
                    _count: {
                        select: {
                            services: true,
                        },
                    },
                },
                where: {
                    services: {
                        some: {
                            data_inicio: {
                                gte: new Date(today.getFullYear(), currentMonth - 1, 1),
                                lte: new Date(today.getFullYear(), currentMonth, 0),
                            },
                        },
                    },
                },
            });

            const employeeInfo = results.map((result) => ({
                employee_name: result.name,
                total_servicos: result._count.services,
            }));

            return res.status(200).json(employeeInfo);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar serviços por funcionário' });
        }
    } else {
        return res.status(405).json({ error: 'Método não permitido' });
    }
}
