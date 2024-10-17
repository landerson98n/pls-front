import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;

      const result = await prisma.expenses.aggregate({
        _sum: {
          valor: true,
        },
        where: {
          data: {
            gte: new Date(today.getFullYear(), currentMonth - 1, 1),
            lte: new Date(today.getFullYear(), currentMonth, 0),
          },
        },
      });

      const total_expenses = result._sum.valor || 0;
      return res.status(200).json({ total_expenses });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar despesas' });
    }
  } else {
    return res.status(405).json({ error: 'Método não permitido' });
  }
}
