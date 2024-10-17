import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { dataInicio, dataFinal } = req.query;

            // Verifica se as datas foram fornecidas
            if (!dataInicio || !dataFinal) {
                return res.status(400).json({ error: 'As datas de início e final são obrigatórias' });
            }

            // Converte as strings para objetos de data
            const startDate = new Date(dataInicio);
            const endDate = new Date(dataFinal);

            // Verifica se as datas são válidas
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({ error: 'Formato de data inválido' });
            }

            const results = await prisma.aircraft.findMany({
                select: {
                    registration: true,
                    expenses: {
                        select: {
                            valor: true,
                        },
                        where: {
                            data: {
                                gte: startDate,
                                lte: endDate,
                            },
                        },
                    },
                },
            });

            const aircraftExpenses = results.map((result) => {
                const total_despesas = result.expenses.reduce((acc, expense) => acc + expense.valor, 0);

                return {
                    aircraft_name: result.registration,
                    total_despesas: total_despesas,
                };
            });

            return res.status(200).json(aircraftExpenses);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar despesas por aeronave' });
        }
    } else {
        return res.status(405).json({ error: 'Método não permitido' });
    }
}
