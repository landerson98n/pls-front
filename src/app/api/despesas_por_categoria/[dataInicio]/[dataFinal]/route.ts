import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { dataInicio, dataFinal } = req.query; // Recebe os parâmetros de data de início e fim

    try {
      // Verifica se as datas foram enviadas e se são válidas
      if (!dataInicio || !dataFinal || isNaN(Date.parse(dataInicio)) || isNaN(Date.parse(dataFinal))) {
        return res.status(400).json({ error: 'Datas inválidas. Use o formato YYYY-MM-DD.' });
      }

      const startDate = new Date(dataInicio); // Data de início
      const endDate = new Date(dataFinal); // Data de fim

      const categorias = [
        'Despesa do Avião',
        'Despesa do Veículo',
        'Despesa Específica',
        'Comissão do Funcionário',
      ];

      const results = await Promise.all(
        categorias.map(async (origem) => {
          const result = await prisma.expenses.aggregate({
            _sum: {
              valor: true,
            },
            where: {
              data: {
                gte: startDate,
                lte: endDate,
              },
              origem,
            },
          });

          return {
            categoria: origem,
            total: result._sum.valor || 0,
          };
        })
      );

      const despesasPorCategoria = results.reduce((acc, curr) => {
        acc[curr.categoria] = curr.total;
        return acc;
      }, {});

      return res.status(200).json(despesasPorCategoria);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar despesas por categoria' });
    }
  } else {
    return res.status(405).json({ error: 'Método não permitido' });
  }
}
