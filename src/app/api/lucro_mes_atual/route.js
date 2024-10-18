import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;

      // Receita do mês atual
      const result_valor = await prisma.services.aggregate({
        _sum: {
          valor_total_da_area: true,
        },
        where: {
          data_inicio: {
            gte: new Date(today.getFullYear(), currentMonth - 1, 1),
            lte: new Date(today.getFullYear(), currentMonth, 0),
          },
        },
      });
      const total_valor = result_valor._sum.valor_total_da_area || 0;

      // Despesas do mês atual
      const result_despesas = await prisma.expenses.aggregate({
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
      const total_despesas = result_despesas._sum.valor || 0;

      // Lucro
      const lucro = total_valor - total_despesas;

      return res.status(200).json({ lucro });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao calcular lucro' });
    }
  } else {
    return res.status(405).json({ error: 'Método não permitido' });
  }
}
