'use client'
import React, { useContext, useEffect, useState } from 'react'
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
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { aircraft, employees } from '@prisma/client'
import { SafraContext } from '@/app/pages/utils/context/safraContext'

const serviceSchema = z.object({
  data_inicio: z.string().nonempty('Data de início é obrigatória'),
  data_final: z.string().nonempty('Data final é obrigatória'),
  solicitante_da_area: z.string().nonempty('Solicitante da área é obrigatório'),
  nome_da_area: z.string().nonempty('Nome da área é obrigatório'),
  tamanho_area_hectares: z.number().positive('Tamanho da área deve ser positivo'),
  tipo_aplicacao_na_area: z.string().nonempty('Tipo de aplicação é obrigatório'),
  quantidade_no_hopper_por_voo: z.number().positive('Quantidade no hopper deve ser positiva'),
  tipo_de_vazao: z.number().positive('Tipo de vazão é obrigatório'),
  quantidade_de_voos_na_area: z.number().int().positive('Quantidade de voos deve ser um número inteiro positivo'),
  valor_total_da_area: z.number().positive('Valor total da área deve ser positivo'),
  confirmacao_de_pagamento_da_area: z.string().nonempty('Confirmação de pagamento é obrigatória'),
  tempo_de_voo_gasto_na_area: z.string().nonempty('Tempo de vôo é obrigatório'),
  aeronave_id: z.string().nonempty('Aeronave é obrigatória'),
  employee_id: z.string().nonempty('Piloto é obrigatório'),
  confirmacao_de_pagamento_do_piloto: z.enum(['Em aberto', 'Pago'], {
    errorMap: () => ({ message: 'Confirmação de pagamento do piloto é obrigatória' }),
  }),
  valor_por_hectare: z.number().positive('Tamanho da área deve ser positivo'),
  valor_por_alqueire: z.number().positive('Tamanho da área deve ser positivo'),
  comissao_piloto: z.number().positive('Tamanho da área deve ser positivo'),
  porcentagem_comissao: z.number().positive('Tamanho da área deve ser positivo'),
  tamanho_area_alqueires: z.number().positive('Tamanho da área deve ser positivo'),
  valor_medio_por_hora_de_voo: z.number().positive('Tamanho da área deve ser positivo'),
  lucro_por_area: z.number().positive('Tamanho da área deve ser positivo'),
  percentual_de_lucro_liquido_por_area: z.number().positive('Tamanho da área deve ser positivo'),
  other_id: z.string().optional(),
  porcentagem_comissao_other: z.number().optional(),
  comissao_other: z.number().optional(),
  confirmacao_de_pagamento_other: z.string().optional()
})

type ServiceFormData = z.infer<typeof serviceSchema>

export function RegisterService() {
  const queryClient = useQueryClient()
  const { selectedSafra } = useContext(SafraContext);
  const { control, handleSubmit, formState: { errors }, reset, setValue, getValues } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      data_inicio: '',
      data_final: '',
      solicitante_da_area: '',
      nome_da_area: '',
      tamanho_area_hectares: undefined,
      tipo_aplicacao_na_area: '',
      quantidade_no_hopper_por_voo: undefined,
      tipo_de_vazao: 0,
      quantidade_de_voos_na_area: undefined,
      valor_total_da_area: undefined,
      confirmacao_de_pagamento_da_area: '',
      tempo_de_voo_gasto_na_area: '',
      aeronave_id: '',
      employee_id: '',
      confirmacao_de_pagamento_do_piloto: undefined,
      valor_por_hectare: 0,
      porcentagem_comissao: 0,
      comissao_piloto: 0,
      valor_por_alqueire: 0,
      valor_medio_por_hora_de_voo: 0,
      tamanho_area_alqueires: 0,
      lucro_por_area: 0,
      percentual_de_lucro_liquido_por_area: 0,
      other_id: '',
      porcentagem_comissao_other: 0,
      comissao_other: 0,
      confirmacao_de_pagamento_other: ''
    }
  })
  const { data: aeronaves, isLoading: aircraftsLoad } = useQuery<aircraft[]>({
    queryKey: ['aircrafts'],
    queryFn: async () => {
      const response = await axios.get(`/api/aircraft/`);
      return response.data as aircraft[]
    },
    enabled: !!selectedSafra,
    initialData: [],
  })

  const { data: employees, isLoading: employeesLoad } = useQuery<employees[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await axios.get(`/api/employees/`);
      return response.data as employees[]
    },
    enabled: !!selectedSafra,
    initialData: [],
  })

  const onSubmit = (data: ServiceFormData) => {
    try {
      if (!selectedSafra.dataFinal) {
        toast({
          title: "Error",
          description: `Safra não selecionada`,
          variant: 'destructive'
        })
        return
      }
      const year = format(selectedSafra.dataFinal, 'yyyy');
      const data_inicio_completa = `${data.data_inicio}/${year}`;
      const data_final_completa = `${data.data_final}/${year}`;
      const token = JSON.parse(localStorage.getItem('token') || JSON.stringify(""))
      const time = data.tempo_de_voo_gasto_na_area.split(":")
      const hour = parseFloat(time[0]) + parseFloat(time[1]) / 60
      const resp = axios.post('/api/services', {
        ...data,
        data_inicio: data_inicio_completa,
        data_final: data_final_completa,
        criado_por: token?.user?.id || 1,
        tempo_de_voo_gasto_na_area: hour
      })

      toast({
        title: "Serviço cadastrado",
        description: `O serviço foi cadastrada com sucesso!`,
      })
      queryClient.refetchQueries()
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
    <div className="p-6 bg-[#556B2F] rounded-lg shadow text-white">
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
              render={({ field }) =>
                <Input type="number" {...field} onChange={(e) => {
                  const hectares = parseFloat(e.target.value);
                  field.onChange(hectares);
                  setValue("tamanho_area_alqueires", hectares / 4.84);
                }} />
              }
            />
            {errors.tamanho_area_hectares && <p className="text-red-500 text-sm mt-1">{errors.tamanho_area_hectares.message}</p>}
          </div>

          <div>
            <Label htmlFor="valor_total_da_area">Valor Total da Área</Label>
            <Controller
              name="valor_total_da_area"
              control={control}
              render={({ field }) => <Input type="number" step="any"  {...field}
                onChange={e => {
                  field.onChange(parseFloat(e.target.value))
                  setValue('valor_por_hectare', field.value / getValues('tamanho_area_hectares'))
                  setValue('valor_por_alqueire', getValues('valor_por_hectare') * 4.84)
                }} />}
            />
            {errors.valor_total_da_area && <p className="text-red-500 text-sm mt-1">{errors.valor_total_da_area.message}</p>}
          </div>

          <div>
            <Label htmlFor="tempo_de_voo_gasto_na_area">Tempo de Vôo Gasto na Area</Label>
            <Controller
              name="tempo_de_voo_gasto_na_area"
              control={control}
              render={({ field }) => <Input type="time" {...field}
                onChange={e => {
                  field.onChange(e.target.value)
                  setValue('valor_medio_por_hora_de_voo', getValues('valor_total_da_area') / parseInt(e.target.value))
                }} />}
            />
            {errors.tempo_de_voo_gasto_na_area && <p className="text-red-500 text-sm mt-1">{errors.tempo_de_voo_gasto_na_area.message}</p>}
          </div>

          <div>
            <Label htmlFor="tamanho_area_alqueires">Tamanho da Área (Alqueres)</Label>
            <Controller
              name="tamanho_area_alqueires"
              control={control}
              render={({ field }) => (
                <Input disabled type="number" value={field.value.toFixed(2)} />
              )}
            />
            {errors.tamanho_area_alqueires && <p className="text-red-500 text-sm mt-1">{errors.tamanho_area_alqueires.message}</p>}

          </div>


          <div>
            <Label htmlFor="valor_por_hectare">Valor por Hectare</Label>
            <Controller
              name="valor_por_hectare"
              control={control}
              render={({ field }) => (
                <Input disabled type="number" value={field.value.toFixed(2)} />
              )}
            />
            {errors.valor_por_hectare && <p className="text-red-500 text-sm mt-1">{errors.valor_por_hectare.message}</p>}

          </div>
          <div>
            <Label htmlFor="valor_por_alqueire">Valor por Alquere</Label>
            <Controller
              name="valor_por_alqueire"
              control={control}
              render={({ field }) => (
                <Input disabled type="number" value={field.value.toFixed(2)} />
              )}
            />
          </div>
          <div>
            <Label htmlFor="valor_medio_por_hora_de_voo">Valor Medio Por Horas de Voo</Label>
            <Controller
              name="valor_medio_por_hora_de_voo"
              control={control}
              render={({ field }) => (
                <Input disabled type="number" value={field.value.toFixed(2)} />
              )}
            />
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
                    <SelectItem value="liquido">Liquido</SelectItem>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tipo_aplicacao_na_area && <p className="text-red-500 text-sm mt-1">{errors.tipo_aplicacao_na_area.message}</p>}
          </div>
          <div>
            <Label htmlFor="tipo_de_vazao">Tipo de vazão</Label>
            <Controller
              name="tipo_de_vazao"
              control={control}
              render={({ field }) => <Input type='number' {...field} onChange={e => {
                field.onChange(parseFloat(e.target.value))
              }} />}
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
            <Label htmlFor="confirmacao_de_pagamento_da_area">Confirmação de Pagamento da Área</Label>
            <Controller
              name="confirmacao_de_pagamento_da_area"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
            {errors.confirmacao_de_pagamento_da_area && <p className="text-red-500 text-sm mt-1">{errors.confirmacao_de_pagamento_da_area.message}</p>}
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
                    {aeronaves?.map((aeronave) => (
                      <SelectItem key={aeronave.id} value={aeronave.id.toString()}>{aeronave.registration} - {aeronave.brand} - {aeronave.model}</SelectItem>
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
                    {employees?.map((employee) => (
                      employee.role === 'Piloto' && <SelectItem key={employee.id} value={employee.id.toString()}>{employee.name} - {employee.role}</SelectItem>
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
          <div>
            <Label htmlFor="porcentagem_comissao">Porcentagem da Comissão</Label>
            <Controller
              name="porcentagem_comissao"
              control={control}
              render={({ field }) => <Input {...field} type='number' onChange={e => {
                field.onChange(parseFloat(e.target.value))
                setValue('comissao_piloto', getValues('porcentagem_comissao') * getValues('valor_total_da_area') / 100)
                setValue('lucro_por_area', getValues('valor_total_da_area') - getValues('porcentagem_comissao') * getValues('valor_total_da_area') / 100)
                setValue('percentual_de_lucro_liquido_por_area', getValues('lucro_por_area') * 100 / getValues('valor_total_da_area'))
              }} />}
            />
            {errors.porcentagem_comissao && <p className="text-red-500 text-sm mt-1">{errors.porcentagem_comissao.message}</p>}
          </div>
          <div>
            <Label htmlFor="comissao_piloto">Comissão do Piloto</Label>
            <Controller
              name="comissao_piloto"
              control={control}
              render={({ field }) => <Input disabled {...field} type='number' onChange={e => {
                field.onChange(parseFloat(e.target.value))

              }} />}
            />
            {errors.comissao_piloto && <p className="text-red-500 text-sm mt-1">{errors.comissao_piloto.message}</p>}
          </div>

          <div>
            <Label htmlFor="other_id">Outro Funcionário</Label>
            <Controller
              name="other_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="other_id" className="border-[#FC862D] focus:ring-[#FC862D]">
                    <SelectValue placeholder="Selecione o funcionário" >
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((employee) => (
                      employee.role !== 'Piloto' && <SelectItem key={employee.id} value={employee.id.toString()}>{employee.name} - {employee.role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.employee_id && <p className="text-red-500 text-sm mt-1">{errors.employee_id.message}</p>}
          </div>
          <div>
            <Label htmlFor="porcentagem_comissao_other">Porcentagem da Comissão Outro Funcionário</Label>
            <Controller
              name="porcentagem_comissao_other"
              control={control}
              render={({ field }) => <Input {...field} type='number' onChange={e => {
                field.onChange(parseFloat(e.target.value))
                setValue('comissao_other', (getValues('porcentagem_comissao_other') || 0) * getValues('valor_total_da_area') / 100)
                setValue('lucro_por_area', getValues('valor_total_da_area') - (getValues('porcentagem_comissao_other') || 0) * getValues('valor_total_da_area') / 100)
                setValue('percentual_de_lucro_liquido_por_area', getValues('lucro_por_area') * 100 / getValues('valor_total_da_area'))
              }} />}
            />
            {errors.porcentagem_comissao && <p className="text-red-500 text-sm mt-1">{errors.porcentagem_comissao.message}</p>}
          </div>

          <div>
            <Label htmlFor="comissao_other">Comissão do Outro Funcionário</Label>
            <Controller
              name="comissao_other"
              control={control}
              render={({ field }) => <Input disabled {...field} type='number' onChange={e => {
                field.onChange(parseFloat(e.target.value))
              }} />}
            />
            {errors.comissao_other && <p className="text-red-500 text-sm mt-1">{errors.comissao_other.message}</p>}
          </div>

          <div>
            <Label htmlFor="confirmacao_de_pagamento_other">Confirmação de Pagamento do Outro Funcionário</Label>
            <Controller
              name="confirmacao_de_pagamento_other"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="confirmacao_de_pagamento_other" className="border-[#FC862D] focus:ring-[#FC862D]">
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
          <div>
            <Label htmlFor="lucro_por_area">Lucro por Area</Label>
            <Controller
              name="lucro_por_area"
              control={control}
              render={({ field }) => <Input disabled {...field} type='number' />}
            />
            {errors.lucro_por_area && <p className="text-red-500 text-sm mt-1">{errors.lucro_por_area.message}</p>}
          </div>
          <div>
            <Label htmlFor="percentual_de_lucro_liquido_por_area">Percentual de Lucro Líquido por Area</Label>
            <Controller
              name="percentual_de_lucro_liquido_por_area"
              control={control}
              render={({ field }) => <Input disabled {...field} type='number' />}
            />
            {errors.percentual_de_lucro_liquido_por_area && <p className="text-red-500 text-sm mt-1">{errors.percentual_de_lucro_liquido_por_area.message}</p>}
          </div>
        </div>
        <Button type="submit" className="w-full">Adicionar Serviço</Button>
      </form>
    </div>
  )
}