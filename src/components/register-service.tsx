'use client'
import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import axios from 'axios'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import InputMask from 'react-input-mask';

const serviceSchema = z.object({
  data_inicio: z.string().nonempty('Data de início é obrigatória'),
  data_final: z.string().nonempty('Data final é obrigatória'),
  solicitante_da_area: z.string().nonempty('Solicitante da área é obrigatório'),
  nome_da_area: z.string().nonempty('Nome da área é obrigatório'),
  tamanho_area_hectares: z.number().positive('Tamanho da área deve ser positivo'),
  tipo_aplicacao_na_area: z.string().nonempty('Tipo de aplicação é obrigatório'),
  quantidade_no_hopper_por_voo: z.number().positive('Quantidade no hopper deve ser positiva'),
  tipo_de_vazao: z.string().nonempty('Tipo de vazão é obrigatório'),
  quantidade_de_voos_na_area: z.number().int().positive('Quantidade de voos deve ser um número inteiro positivo'),
  valor_total_da_area: z.number().positive('Valor total da área deve ser positivo'),
  confirmacao_de_pagamento_da_area: z.string().nonempty('Confirmação de pagamento é obrigatória'),
  tempo_de_voo_gasto_na_area: z.string().nonempty('Tempo de vôo necessário'),
  aeronave_id: z.string().nonempty('Aeronave é obrigatória'),
  employee_id: z.string().nonempty('Piloto é obrigatório'),
  confirmacao_de_pagamento_do_piloto: z.enum(['Em aberto', 'Pago'], {
    errorMap: () => ({ message: 'Confirmação de pagamento do piloto é obrigatória' }),
  })
})

type ServiceFormData = z.infer<typeof serviceSchema>

type Safra = {
  id: string;
  startDate: string;
  endDate: string;
  label: string;
}

export function RegisterService({ selectedSafra }: { selectedSafra: Safra }) {
  const [aeronaves, setAeronaves] = useState([])
  const [employees, setEmployees] = useState([])

  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      data_inicio: '',
      data_final: '',
      solicitante_da_area: '',
      nome_da_area: '',
      tamanho_area_hectares: undefined,
      tipo_aplicacao_na_area: '',
      quantidade_no_hopper_por_voo: undefined,
      tipo_de_vazao: '',
      quantidade_de_voos_na_area: undefined,
      valor_total_da_area: undefined,
      confirmacao_de_pagamento_da_area: '',
      tempo_de_voo_gasto_na_area: '',
      aeronave_id: '',
      employee_id: '',
      confirmacao_de_pagamento_do_piloto: undefined,
    }
  })

  useEffect(() => {
    async function getData() {
      const avioesData = await axios.get('/api/aircraft')
      setAeronaves(avioesData.data)

      const empregadosData = await axios.get('/api/employees')
      setEmployees(empregadosData.data.filter((item) => {
        return item.role === "Piloto"
      }))
    }
    getData()

  }, [])



  const onSubmit = (data: ServiceFormData) => {
    try {
      if (!selectedSafra.endDate) {
        toast({
          title: "Error",
          description: `Safra não selecionada`,
          variant: 'destructive'
        })
        return
      }
      const year = format(selectedSafra.endDate, 'yyyy');
      const data_inicio_completa = `${data.data_inicio}/${year}`;
      const data_final_completa = `${data.data_final}/${year}`;
      const resp = axios.post('/api/services', {
        ...data,
        tempo_de_voo_gasto_na_area:
          parseFloat(data.tempo_de_voo_gasto_na_area),
        data_inicio: data_inicio_completa,
        data_final: data_final_completa
      })

      toast({
        title: "Serviço cadastrado",
        description: `O serviço foi cadastrada com sucesso!`,
      })
      reset()
    } catch (error) {
      console.log(error);

      toast({
        title: "Error",
        description: `Erro ao cadastrar serviço`,
        variant: 'destructive'
      })
    }
  }


  return (
    <div className="p-6 bg-[#4B5320] rounded-lg shadow text-white">
      <h2 className="text-2xl font-bold mb-6">Cadastrar Serviços</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="data_inicio">Data de início</Label>
            <Controller
              name="data_inicio"
              control={control}
              render={({ field }) => (
                <InputMask mask="99/99" placeholder="MM/DD" {...field}>
                  {(inputProps) => <Input {...inputProps} />}
                </InputMask>
              )}
            />
            {errors.data_inicio && (
              <p className="text-red-500 text-sm mt-1">
                {errors.data_inicio.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="data_final">Data final</Label>
            <Controller
              name="data_final"
              control={control}
              render={({ field }) => (
                <InputMask mask="99/99" placeholder="MM/DD" {...field}>
                  {(inputProps) => <Input {...inputProps} />}
                </InputMask>
              )}
            />
            {errors.data_final && (
              <p className="text-red-500 text-sm mt-1">
                {errors.data_final.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="solicitante_da_area">Solicitante da área</Label>
            <Controller
              name="solicitante_da_area"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
            {errors.solicitante_da_area && <p className="text-red-500 text-sm mt-1">{errors.solicitante_da_area.message}</p>}
          </div>
          <div>
            <Label htmlFor="nome_da_area">Nome da Área</Label>
            <Controller
              name="nome_da_area"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
            {errors.nome_da_area && <p className="text-red-500 text-sm mt-1">{errors.nome_da_area.message}</p>}
          </div>
          <div>
            <Label htmlFor="tamanho_area_hectares">Tamanho da Área (Hectares)</Label>
            <Controller
              name="tamanho_area_hectares"
              control={control}
              render={({ field }) => <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />}
            />
            {errors.tamanho_area_hectares && <p className="text-red-500 text-sm mt-1">{errors.tamanho_area_hectares.message}</p>}
          </div>
          <div>
            <Label htmlFor="tipo_aplicacao_na_area">Tipo de Aplicação na Área</Label>
            <Controller
              name="tipo_aplicacao_na_area"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="tipo_aplicacao_na_area" className="border-[#FC862D] focus:ring-[#FC862D]">
                    <SelectValue placeholder="Selecione o tipo de aplicação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semente">Semente</SelectItem>
                    <SelectItem value="fertilizante">Fertilizante</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tipo_aplicacao_na_area && <p className="text-red-500 text-sm mt-1">{errors.tipo_aplicacao_na_area.message}</p>}
          </div>
          <div>
            <Label htmlFor="quantidade_no_hopper_por_voo">Quantidade no hopper por voo</Label>
            <Controller
              name="quantidade_no_hopper_por_voo"
              control={control}
              render={({ field }) => <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />}
            />
            {errors.quantidade_no_hopper_por_voo && <p className="text-red-500 text-sm mt-1">{errors.quantidade_no_hopper_por_voo.message}</p>}
          </div>
          <div>
            <Label htmlFor="tipo_de_vazao">Tipo de vazão</Label>
            <Controller
              name="tipo_de_vazao"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
            {errors.tipo_de_vazao && <p className="text-red-500 text-sm mt-1">{errors.tipo_de_vazao.message}</p>}
          </div>
          <div>
            <Label htmlFor="quantidade_de_voos_na_area">Quantidade de voos na área</Label>
            <Controller
              name="quantidade_de_voos_na_area"
              control={control}
              render={({ field }) => <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />}
            />
            {errors.quantidade_de_voos_na_area && <p className="text-red-500 text-sm mt-1">{errors.quantidade_de_voos_na_area.message}</p>}
          </div>
          <div>
            <Label htmlFor="valor_total_da_area">Valor Total da Área</Label>
            <Controller
              name="valor_total_da_area"
              control={control}
              render={({ field }) => <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />}
            />
            {errors.valor_total_da_area && <p className="text-red-500 text-sm mt-1">{errors.valor_total_da_area.message}</p>}
          </div>
          <div>
            <Label htmlFor="confirmacao_de_pagamento_da_area">Confirmação de Pagamento da Área</Label>
            <Controller
              name="confirmacao_de_pagamento_da_area"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
            {errors.confirmacao_de_pagamento_da_area && <p className="text-red-500 text-sm mt-1">{errors.confirmacao_de_pagamento_da_area.message}</p>}
          </div>
          <div>
            <Label htmlFor="tempo_de_voo_gasto_na_area">Tempo de Voo Gasto na Área</Label>
            <Controller
              name="tempo_de_voo_gasto_na_area"
              control={control}
              render={({ field }) => <Input {...field} type='number' />}
            />
            {errors.tempo_de_voo_gasto_na_area && <p className="text-red-500 text-sm mt-1">{errors.tempo_de_voo_gasto_na_area.message}</p>}
          </div>
          <div>
            <Label htmlFor="aeronave_id">Aeronave</Label>
            <Controller
              name="aeronave_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="aeronave_id" className="border-[#FC862D] focus:ring-[#FC862D]">
                    <SelectValue placeholder="Selecione a aeronave" >
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {aeronaves.map((aeronave) => (
                      <SelectItem key={aeronave.id} value={aeronave.id.toString()}>{aeronave.model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.aeronave_id && <p className="text-red-500 text-sm mt-1">{errors.aeronave_id.message}</p>}
          </div>
          <div>
            <Label htmlFor="employee_id">Piloto</Label>
            <Controller
              name="employee_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="employee_id" className="border-[#FC862D] focus:ring-[#FC862D]">
                    <SelectValue placeholder="Selecione o piloto" >
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>{employee.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.employee_id && <p className="text-red-500 text-sm mt-1">{errors.employee_id.message}</p>}
          </div>
          <div>
            <Label htmlFor="confirmacao_de_pagamento_do_piloto">Confirmação de Pagamento do Piloto</Label>
            <Controller
              name="confirmacao_de_pagamento_do_piloto"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="confirmacao_de_pagamento_do_piloto" className="border-[#FC862D] focus:ring-[#FC862D]">
                    <SelectValue placeholder="Selecione o status de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Em aberto">Em aberto</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.confirmacao_de_pagamento_do_piloto && <p className="text-red-500 text-sm mt-1">{errors.confirmacao_de_pagamento_do_piloto.message}</p>}
          </div>
        </div>
        <Button type="submit" className="w-full">Adicionar Serviço</Button>
      </form>
    </div>
  )
}