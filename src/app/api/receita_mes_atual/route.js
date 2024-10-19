import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;

      const result = await prisma.services.aggregate({
        _sum: {
          valor_total_da_area: true,
        },
        where: {
          criado_em: {
            gte: new Date(today.getFullYear(), currentMonth - 1, 1),
            lte: new Date(today.getFullYear(), currentMonth, 0),
          },
        },
      });

      const total_valor = result._sum.valor_total_da_area || 0;
      return res.status(200).json({ total_valor });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar receita' });
    }
  } else {
    return res.status(405).json({ error: 'Método não permitido' });
  }
}
