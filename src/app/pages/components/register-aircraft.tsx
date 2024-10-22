'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Toast } from '../../../components/ui/toast'
import { toast } from '@/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'

const aircraftSchema = z.object({
  registration: z.string().min(5, 'Matrícula deve ter pelo menos 5 caracteres'),
  brand: z.string().min(2, 'Marca deve ter pelo menos 2 caracteres'),
  model: z.string().min(2, 'Modelo deve ter pelo menos 2 caracteres'),
})

type AircraftFormValues = z.infer<typeof aircraftSchema>

export function RegisterAircraft() {
  const queryClient = useQueryClient();
  const form = useForm<AircraftFormValues>({
    resolver: zodResolver(aircraftSchema),
    defaultValues: {
      registration: '',
      brand: '',
      model: '',
    },
  })
  const onSubmit = async (data: AircraftFormValues) => {
    try {
      const response = await axios.post('/api/aircraft', data)
      toast({
        title: "Aeronave cadastrada com sucesso!",
        description: `A aeronave ${data.registration} foi adicionada.`,
      })
      await queryClient.refetchQueries()
      form.reset()
    } catch (error) {
      console.error('Error creating aircraft:', error)
      toast({
        title: "Erro ao cadastrar aeronave",
        description: "Ocorreu um erro ao tentar cadastrar a aeronave. Por favor, tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6 bg-[#556B2F] text-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Cadastrar Aeronave</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="registration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matrícula</FormLabel>
                <FormControl>
                  <Input placeholder="Matrícula da aeronave" {...field} className="bg-[#556B2F] text-white border-[#8FBC8F] placeholder:text-gray-400" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Marca da aeronave" {...field} className="bg-[#556B2F] text-white border-[#8FBC8F] placeholder:text-gray-400" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="Modelo da aeronave" {...field} className="bg-[#556B2F] text-white border-[#8FBC8F] placeholder:text-gray-400" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-[#8FBC8F] text-[#4B5320] hover:bg-[#006400]">
            Cadastrar Aeronave
          </Button>
        </form>
      </Form>
    </div>
  )
}