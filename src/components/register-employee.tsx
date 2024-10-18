'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from '@/hooks/use-toast'

const employeeSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  employeeType: z.enum(['Auxiliar de pista','Piloto', 'Mecânico', 'Administrativo', 'Outro']),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

export function RegisterEmployee() {
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      employeeType: 'Outro',
    },
  })

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      const response = await axios.post('/api/employees', { name: data.name, role: data.employeeType })
      console.log('Employee created:', response.data)
      toast({
        title: "Funcionário cadastrado com sucesso!",
        description: `${data.name} foi adicionado como ${data.employeeType}.`,
      })
      form.reset()
    } catch (error) {
      console.error('Error creating employee:', error)
      toast({
        title: "Erro ao cadastrar funcionário",
        description: "Ocorreu um erro ao tentar cadastrar o funcionário. Por favor, tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6 bg-[#4B5320] text-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Cadastrar Funcionários</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do funcionário" {...field} className="bg-[#556B2F] text-white border-[#8FBC8F]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
         
          <FormField
            control={form.control}
            name="employeeType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Funcionário</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-[#556B2F] text-white border-[#8FBC8F]">
                      <SelectValue placeholder="Selecione o tipo de funcionário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#556B2F] text-white">
                    <SelectItem value="Piloto">Piloto</SelectItem>
                    <SelectItem value="Mecânico">Mecânico</SelectItem>
                    <SelectItem value="Auxiliar de pista">Administrativo</SelectItem>
                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-[#8FBC8F] text-[#4B5320] hover:bg-[#006400]">
            Cadastrar Funcionário
          </Button>
        </form>
      </Form>
    </div>
  )
}