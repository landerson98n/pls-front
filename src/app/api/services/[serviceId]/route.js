import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { serviceId } = req.query;

  if (req.method === 'GET') {
    try {
      const service = await prisma.services.findUnique({
        where: {
          id: Number(serviceId),
        },
        include: {
          aircraft: true,
          employee: true,
          author: true,
        },
      });

      if (!service) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      const serviceData = {
        id: service.id,
        data_inicio: service.data_inicio.toLocaleDateString('pt-BR'),
        data_final: service.data_final?.toLocaleDateString('pt-BR') || null,
        solicitante_da_area: service.solicitante_da_area,
        nome_da_area: service.nome_da_area,
        aeronave_data: `${service.aircraft.registration} - ${service.aircraft.brand} - ${service.aircraft.model}`,
        employee_data: service.employee
          ? `${service.employee.name} - ${service.employee.role}`
          : 'Piloto não informado',
        criado_por: service.author.name,
      };

      return res.status(200).json(serviceData);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar serviço' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.expenses.deleteMany({
        where: {
          service_id: Number(serviceId),
        },
      });

      await prisma.services.delete({
        where: {
          id: Number(serviceId),
        },
      });

      return res.status(204).json({});
    } catch (error) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const body = await req.json();

      const {
        data_inicio,
        data_final,
        solicitante_da_area,
        nome_da_area,
        aeronave_id,
        employee_id,
        criado_por
      } = body;

      const updatedService = await prisma.services.update({
        where: {
          id: Number(serviceId),
        },
        data: {
          data_inicio: new Date(data_inicio),
          data_final: data_final ? new Date(data_final) : null,
          solicitante_da_area,
          nome_da_area,
          aeronave_id,
          employee_id,
          criado_por
        },
      });

      return res.status(200).json(updatedService);
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      return res.status(500).json({ error: 'Erro ao atualizar serviço' });
    }
  }
}
