import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const today = new Date();
            const currentMonth = today.getMonth() + 1;

            const results = await prisma.employees.findMany({
                select: {
                    name: true,
                    expenses: {
                        select: {
                            valor: true,
                        },
                        where: {
                            data: {
                                gte: new Date(today.getFullYear(), currentMonth - 1, 1),
                                lte: new Date(today.getFullYear(), currentMonth, 0),
                            },
                        },
                    },
                },
            });

            const employeeExpenses = results.map((result) => {
                const total_despesas = result.expenses.reduce((acc, expense) => acc + expense.valor, 0);

                return {
                    employee_name: result.name,
                    total_despesas: total_despesas,
                };
            });

            return res.status(200).json(employeeExpenses);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar despesas por funcionário' });
        }
    } else {
        return res.status(405).json({ error: 'Método não permitido' });
    }
}
