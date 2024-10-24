'use client'

import React, { useContext, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { toast } from '@/hooks/use-toast'
import InputMask from 'react-input-mask';
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { aircraft, employees, services } from '@prisma/client'
import { SafraContext } from '@/app/pages/utils/context/safraContext'
import { format } from 'date-fns'

const baseSchema = z.object({
  data: z.string({
    required_error: "A data é obrigatória.",
  }),
  origem: z.enum(['Comissão do Funcionário', 'Despesa do Avião', 'Despesa do Veículo', 'Despesa Específica'], {
    required_error: "A origem da despesa é obrigatória.",
  })
})

const comissaoSchema = baseSchema.extend({
  origem: z.literal('Comissão do Funcionário'),
  employee_id: z.string().min(1, "O funcionário é obrigatório."),
  porcentagem: z.number().min(0).max(100, "A porcentagem deve estar entre 0 e 100."),
  service_id: z.string().min(1, "O serviço é obrigatório."),
})

const despesaAviaoSchema = baseSchema.extend({
  origem: z.literal('Despesa do Avião'),
  aircraft_id: z.string().min(1, "A aeronave é obrigatória."),
  tipo: z.string().min(1, "O tipo é obrigatório."),
  descricao: z.string().min(1, "A descrição é obrigatória."),
  valor: z.number().positive("O valor deve ser positivo."),
})

const despesaVeiculoSchema = baseSchema.extend({
  origem: z.literal('Despesa do Veículo'),
  tipo: z.string().min(1, "O tipo é obrigatório."),
  descricao: z.string().min(1, "A descrição é obrigatória."),
  valor: z.number().positive("O valor deve ser positivo."),
  aircraft_id: z.string().min(1, "O veículo é obrigatório."),
})

const despesaEspecificaSchema = baseSchema.extend({
  origem: z.literal('Despesa Específica'),
  tipo: z.string().min(1, "O tipo é obrigatório."),
  aircraft_id: z.string().min(1, "A aeronave é obrigatória."),
  descricao: z.string().min(1, "A descrição é obrigatória."),
  valor: z.number().positive("O valor deve ser positivo."),
})

const schema = z.discriminatedUnion('origem', [
  comissaoSchema,
  despesaAviaoSchema,
  despesaVeiculoSchema,
  despesaEspecificaSchema,
])

type ExpenseFormData = z.infer<typeof schema>


export function RegisterExpense() {
  const { selectedSafra } = useContext(SafraContext);

  const { control, handleSubmit, watch, formState: { errors }, reset } = useForm<ExpenseFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      origem: 'Comissão do Funcionário',
      data: '',
      employee_id: '0',
      porcentagem: 0,
      service_id: '0',
    }
  })

  const queryClient = useQueryClient();

  const selectedOrigin = watch('origem')

  const { data: aeronaves, isLoading: aircraftsLoad } = useQuery<aircraft[]>({
    queryKey: ['aircrafts'],
    queryFn: async () => {
      const response = await axios.get(`/api/aircraft/`);
      return response.data as aircraft[]
    },
    initialData: [],
  })

  const { data: funcionario, isLoading: employeesLoad } = useQuery<employees[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await axios.get(`/api/employees/`);
      return response.data as employees[]
    },
    initialData: [],
  })

  const { data: servicos, isLoading: servicesLoad } = useQuery<services[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await axios.get(`/api/services/`);
      return response.data as services[]
    },
    initialData: [],
  })

  const [ano, setAno] = useState(format(selectedSafra.dataFinal, 'yyyy'))

  function corrigirData(dataString) {
    const [dia, mes, ano] = dataString.split('/');
    const dataFormatada = `${ano}-${mes}-${dia}`;
    return new Date(dataFormatada);
  }

  const onSubmit = async (dataExpense: ExpenseFormData) => {
    try {
      const resp = await axios.post('/api/expenses', { ...dataExpense, data: new Date(corrigirData(`${dataExpense.data}/${ano}`)) })
      toast({
        title: "Despesa cadastrada",
        description: `A despesa foi cadastrada com sucesso!`,
      })
      reset()
      queryClient.refetchQueries()
    } catch (error) {
      console.log(error);
      toast({
        title: "Erro",
        description: `A despesa não foi cadastrada!`,
        variant: 'destructive'
      })
    }
  }

  if (errors) {
    console.log(errors);

  }

  return (
    <div className="p-6 bg-[#556B2F] rounded-lg shadow text-white">
      <h2 className="text-2xl font-bold mb-6 text-white">Cadastrar Despesas</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 text-black">
            <Label htmlFor="data " className='text-white'>Data</Label>
            <Controller
              name="data"
              control={control}
              render={({ field }) => (
                <InputMask mask="99/99" className='text-white' placeholder="MM/DD" {...field}>
                  {(inputProps) => <Input {...inputProps} />}
                </InputMask>
              )}
            />
            {errors.data && <p className="text-red-500 text-sm">{errors.data.message}</p>}


          </div>
          <div className="space-y-2">
            <Label htmlFor="data " className='text-white'>Ano</Label>
            <Select onValueChange={setAno} value={ano}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem  value={format(selectedSafra.dataInicio, 'yyyy')}>{format(selectedSafra.dataInicio, 'yyyy')}</SelectItem>
                <SelectItem value={format(selectedSafra.dataFinal, 'yyyy')}>{format(selectedSafra.dataFinal, 'yyyy')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="origem">Origem da despesa</Label>
            <Controller
              name="origem"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Comissão do Funcionário">Comissão do Funcionário</SelectItem>
                    <SelectItem value="Despesa do Avião">Despesa do Avião</SelectItem>
                    <SelectItem value="Despesa do Veículo">Despesa do Veículo</SelectItem>
                    <SelectItem value="Despesa Específica">Despesa Específica</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.origem && <p className="text-red-500 text-sm">{errors.origem.message}</p>}
          </div>
        </div>

        {selectedOrigin === 'Comissão do Funcionário' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="employee_id">Funcionário</Label>
              <Controller
                name="employee_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o funcionário" />
                    </SelectTrigger>
                    <SelectContent>
                      {funcionario?.map((item => (
                        <SelectItem value={item.id.toString()}>{item.name} - {item.role}</SelectItem>
                      )))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.employee_id && <p className="text-red-500 text-sm">{errors.employee_id.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="porcentagem">Porcentagem</Label>
              <Controller
                name="porcentagem"
                control={control}
                render={({ field }) => (
                  <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                )}
              />
              {errors.porcentagem && <p className="text-red-500 text-sm">{errors.porcentagem.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="service_id">Serviço</Label>
              <Controller
                name="service_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {servicos?.map((item => (
                        <SelectItem value={item.id.toString()}>
                          {`${item.id} |
                          ${item.nome_da_area} |
                          ${item.solicitante_da_area} de
                          ${new Date(item.data_inicio)?.toLocaleString()} até
                          ${new Date(item.data_final)?.toLocaleString()}`}
                        </SelectItem>
                      )))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.service_id && <p className="text-red-500 text-sm">{errors.service_id.message}</p>}
            </div>
          </>
        )}

        {(selectedOrigin === 'Despesa do Avião' || selectedOrigin === 'Despesa do Veículo' || selectedOrigin === 'Despesa Específica') && (
          <>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Controller
                name="tipo"
                control={control}
                render={({ field }) => (
                  <Select {...field} onValueChange={field.onChange} value={field.value} name='tipo'>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Óleo">Óleo</SelectItem>
                      <SelectItem value="Combustível">Combustível</SelectItem>
                      <SelectItem value="Peças">Peças</SelectItem>
                      <SelectItem value="Serviço">Serviço</SelectItem>
                      <SelectItem value="Específica">Específica</SelectItem>
                      <SelectItem value="Hangar">Hangar</SelectItem>
                      <SelectItem value="Energia">Energia</SelectItem>
                      <SelectItem value="Internet">Internet</SelectItem>
                      <SelectItem value="Salário Funcionário">Salário Funcionário</SelectItem>
                      <SelectItem value="Salário Mecânico">Salário Mecânico</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.tipo && <p className="text-red-500 text-sm">{errors.tipo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Controller
                name="descricao"
                control={control}
                render={({ field }) => <Textarea {...field} />}
              />
              {errors.descricao && <p className="text-red-500 text-sm">{errors.descricao.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor">Valor</Label>
              <Controller
                name="valor"
                control={control}
                render={({ field }) => (
                  <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                )}
              />
              {errors.valor && <p className="text-red-500 text-sm">{errors.valor.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="aircraft_id">{selectedOrigin === 'Despesa do Veículo' ? 'Veículo' : 'Aeronave'}</Label>
              <Controller
                name="aircraft_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Selecione a aeronave`} />
                    </SelectTrigger>
                    <SelectContent>
                      {aeronaves?.map((item => (
                        <SelectItem value={item.id.toString()}>{item.brand} - {item.model} - {item.registration} </SelectItem>
                      )))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.aircraft_id && <p className="text-red-500 text-sm">{errors.aircraft_id.message}</p>}
            </div>
          </>
        )}

        <Button type="submit" className="w-full">Cadastrar Despesa</Button>
      </form>
    </div>
  )
}