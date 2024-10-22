'use client'

import React, { useState, useEffect, useMemo, useContext } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { format } from 'date-fns'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { aircraft, employees, expenses } from '@prisma/client'
import { SafraContext } from '@/app/pages/utils/context/safraContext'
import { useRouter } from 'next/navigation'


export function DashboardPage({ children }) {
  const { selectedSafra } = useContext(SafraContext);
  const router = useRouter()

  const [dataInicio, setStartDate] = useState<Date>()
  const [dataFinal, setEndDate] = useState<Date>()
  const [selectedAircraft, setSelectedAircraft] = useState("")
  const [selectedAircraftId, setSelectedAircraftId] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const safraStartDate = new Date(dataInicio)
  const safraEndDate = new Date(dataFinal)

  useEffect(() => {
    setStartDate(selectedSafra.dataInicio)
    setEndDate(selectedSafra.dataFinal)
  }, [selectedSafra])


  const { data: aircrafts, isLoading: aircraftsLoad } = useQuery<aircraft[]>({
    queryKey: ['aircrafts'],
    queryFn: async () => {
      const response = await axios.get(`/api/aircraft/`);
      return response.data as aircraft[]
    },
    enabled: !!dataInicio,
    initialData: [],
    refetchInterval: 5000
  })

  const { data: employees, isLoading: employeesLoad } = useQuery<employees[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await axios.get(`/api/employees/`);
      return response.data as employees[]
    },
    enabled: !!dataInicio,
    initialData: [],
    refetchInterval: 5000
  })

  const { data: expenses_aircraft, isLoading: expenses_aircraftLoad } = useQuery<expenses[]>({
    queryKey: ['expenses_aircraft'],
    queryFn: async () => {
      const response = await axios.get(`/api/expenses_aircraft/`);
      return response.data.filter((item) => {
        return new Date(item.data) >= safraStartDate && new Date(item.data) <= safraEndDate
      }) as expenses[]
    },
    enabled: !!dataInicio,
    initialData: [],
    refetchInterval: 5000
  })

  const { data: comissions, isLoading: comissionstLoad } = useQuery<expenses[]>({
    queryKey: ['comissions'],
    queryFn: async () => {
      const response = await axios.get(`/api/comissions/`);
      return response.data.filter((item) => {
        return new Date(item.data) >= safraStartDate && new Date(item.data) <= safraEndDate
      }) as []
    },
    enabled: !!dataInicio,
    initialData: [],
    refetchInterval: 5000
  })

  const { data: expenses_vehicles, isLoading: expenses_vehiclesLoad } = useQuery<expenses[]>({
    queryKey: ['expenses_vehicles'],
    queryFn: async () => {
      const response = await axios.get(`/api/expenses_vehicles/`);
      return response.data.filter((item) => {
        return new Date(item.data) >= safraStartDate && new Date(item.data) <= safraEndDate
      }) as []
    },
    enabled: !!dataInicio,
    initialData: [],
    refetchInterval: 5000
  })

  const { data: expenses_specific, isLoading: expenses_specificLoad } = useQuery<expenses[]>({
    queryKey: ['expenses_specific'],
    queryFn: async () => {
      const response = await axios.get(`/api/expenses_specific/`);
      return response.data.filter((item) => {
        return new Date(item.data) >= safraStartDate && new Date(item.data) <= safraEndDate
      }) as []
    },
    enabled: !!dataInicio,
    initialData: [],
    refetchInterval: 5000
  })

  const handleAircraft = (nome: string) => {
    const selected = aircrafts?.filter((item) => {
      return item.registration === nome
    })
    router.push(`/pages/dashboard/${selected[0]?.id}`)
    setSelectedAircraft(selected[0].registration)
    setSelectedAircraftId(selected[0]?.id)
  }



  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toFixed(0)
  }

  const formatTooltipValue = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const filteredExpenses = useMemo(() => {
    const aircraft = expenses_aircraft.filter(e => !selectedAircraftId || e.aircraft_id === selectedAircraftId)
    const commission = comissions.filter(e => !selectedAircraftId || e.aircraft_id === selectedAircraftId)
    const vehicle = expenses_vehicles.filter(e => !selectedAircraftId || e.aircraft_id === selectedAircraftId)
    const specific = expenses_specific.filter(e => !selectedAircraftId || e.aircraft_id === selectedAircraftId)
    return {
      Aeronave: aircraft,
      Comissão: commission,
      Veículo: vehicle,
      Específico: specific,
      Total: [...aircraft, ...commission, ...vehicle, ...specific]
    }
  }, [selectedAircraft])

  const filteredExpensesTotal = useMemo(() => {
    const aircraft = expenses_aircraft
    const commission = comissions
    const vehicle = expenses_vehicles
    const specific = expenses_specific
    return {
      Aeronave: aircraft,
      Comissão: commission,
      Veículo: vehicle,
      Específico: specific,
      Total: [...aircraft, ...commission, ...vehicle, ...specific]
    }
  }, [expenses_aircraft, comissions, expenses_vehicles, expenses_specific])

  const filteredExpensesPiloto = useMemo(() => {
    let data = {};

    comissions.forEach((item) => {
      if (data[item.employee_id]) {
        data[item.employee_id].push(item);
      } else {
        data[item.employee_id] = [item];
      }
    });

    return data;

  }, [comissions])

  const expensesByType = useMemo(() => {
    return Object.entries(filteredExpenses).map(([type, expenses]) => {
      return {
        name: type,
        value: expenses.reduce((sum, expense) => sum + Number(expense.valor), 0)
      }
    })
  }, [filteredExpenses])

  const expensesByTypeTotal = useMemo(() => {
    return Object.entries(filteredExpensesTotal).map(([type, expenses]) => {
      return {
        name: type,
        value: expenses.reduce((sum, expense) => sum + Number(expense.valor), 0)
      }
    })
  }, [filteredExpensesTotal])


  const getEmployeeNameById = (id) => {
    const employee = employees?.find(emp => emp.id === Number(id));
    return employee ? employee.name : 'Desconhecido';
  };

  const expensesByTypePiloto = useMemo(() => {
    return Object.entries(filteredExpensesPiloto).map(([type, expenses]) => {
      return {
        name: getEmployeeNameById(type),
        value: expenses.reduce((sum, expense) => sum + Number(expense.valor), 0)
      }
    })
  }, [filteredExpensesPiloto])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  if (expenses_aircraftLoad) {
    return
  }
  return (
    <div className="p-6 bg-[#4B5320] rounded-lg shadow text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="space-y-2 w-full md:w-auto">
          <Select value={selectedAircraft} onValueChange={handleAircraft}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Selecione a aeronave" />
            </SelectTrigger>
            <SelectContent>
              {aircrafts && aircrafts?.map((item) => (
                <SelectItem key={item.registration} value={item.registration}>{item.registration}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedEmployee} onValueChange={(e) => { setSelectedEmployee(e), router.push(`/pages/dashboard/${selectedAircraftId}/${e}`) }}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Selecione o funcionário" />
            </SelectTrigger>
            <SelectContent>
              {employees?.map((item) => { return item.role === "Piloto" && <SelectItem value={item.id}>{item.name}</SelectItem> }
              )}
            </SelectContent>
          </Select>
        </div>
      </div>


      <div className="space-y-6">
        {children}

        {expensesByTypePiloto && <Card className="bg-[#556B2F]">
          <CardHeader>
            <CardTitle className='text-white'>Total de Comissão Por Piloto</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesByTypePiloto}>
                <XAxis dataKey="name" stroke="white" />
                <YAxis stroke="white" tickFormatter={formatYAxis} />
                <Tooltip
                  formatter={(value) => formatTooltipValue(Number(value))}
                  contentStyle={{ backgroundColor: '#4B5320', border: 'none' }}
                  labelStyle={{ color: 'white' }}
                />
                <Bar dataKey="value" fill="#8884d8">
                  {expensesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>}



        <Card className="bg-[#556B2F]">
          <CardHeader>
            <CardTitle className='text-white'>Despesas por Categoria - TOTAL</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesByTypeTotal}>
                <XAxis dataKey="name" stroke="white" />
                <YAxis stroke="white" tickFormatter={formatYAxis} />
                <Tooltip
                  formatter={(value) => formatTooltipValue(Number(value))}
                  contentStyle={{ backgroundColor: '#4B5320', border: 'none' }}
                  labelStyle={{ color: 'white' }}
                />
                <Bar dataKey="value" fill="#8884d8">
                  {expensesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}