'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { format } from 'date-fns'
import axios from 'axios'

type Safra = {
  id: string;
  dataInicio: string;
  dataFinal: string;
  label: string;
}

type Expense = {
  id: number
  data: string
  origem: string
  tipo?: string
  descricao?: string
  valor: number
  confirmação_de_pagamento: string
  aircraft_name?: string
  porcentagem?: number
  employee_name?: string
  service_name?: string
  harvest: string
  aircraft_id: string
  employee_id: string
}

export function DashboardPage({ selectedSafra }: { selectedSafra: Safra }) {
  const [dataInicio, setStartDate] = useState<Date>()
  const [dataFinal, setEndDate] = useState<Date>()
  const [selectedAircraft, setSelectedAircraft] = useState("")
  const [selectedAircraftId, setSelectedAircraftId] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [aircraftReport, setAircraftReport] = useState({
    nome_aeronave: "Nenhuma aeronave selecionada.",
    total_de_area_aplicada_em_hectares: 0,
    total_de_area_aplicada_em_alqueires: 0,
    valor_total_bruto_recebido: 0,
    valor_medio_de_hectares_total: 0,
    valor_medio_de_alqueires_total: 0,
    total_de_horas_voadas: 0,
    valor_medio_por_hora_de_voo_total: 0,
    lucro_total: 0,
    total_gasto_combustivel: 0,
    total_gasto_oleo: 0,
    comissoes_de_pilotos: 0,
    comissoes_de_badeco: 0,
    restante_das_despesas: 0,
    despesas_de_veiculo: 0,
    despesas_de_especificas: 0,
  })
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [profitData, setProfitData] = useState<any[]>([])
  const [balanceData, setBalanceData] = useState<any>(null)
  const [expensesData, setExpensesData] = useState<any[]>([])
  const [aircrafts, setAircrafts] = useState<any[]>()
  const [employees, setEmployees] = useState<any[]>()
  const [valorSpecific, setValorSpecific] = useState(0)
  const [expenses, setExpenses] = useState<Record<string, Expense[]>>({
    aircraft: [],
    commission: [],
    vehicle: [],
    specific: [],
  })

  useEffect(() => {
    fetchData()
  }, [dataInicio, dataFinal, selectedEmployee])

  useEffect(() => {
    setStartDate(selectedSafra.dataInicio)
    setEndDate(selectedSafra.dataFinal)
  }, [selectedSafra])

  useEffect(() => {
    fetchDataSpecific()
  }, [selectedAircraftId, selectedEmployee, dataInicio, dataFinal])

  const fetchDataSpecific = async () => {
    const startDateStr = dataInicio && format(dataInicio, 'dd_MM_yyyy');
    const endDateStr = dataFinal && format(dataFinal, 'dd_MM_yyyy');

    if (selectedAircraftId) {
      const balanceRes = await axios.get(`/api/gerar_balanco/${startDateStr}/${endDateStr}/${selectedAircraftId}`)
      const aircraftReportRes = await axios.get(`/api/gerar_relatorio_da_aeronave/${startDateStr}/${endDateStr}/${selectedAircraftId}/`)
      setAircraftReport(aircraftReportRes.data)
      setBalanceData(balanceRes.data)
    }

    if (selectedEmployee && selectedAircraftId) {
      const expensesRes = await axios.get(`/api/despesas_por_categoria_especifica/${startDateStr}/${endDateStr}/${selectedEmployee}/${selectedAircraftId}/`)
      const valorTotalSpecific = expensesRes.data.reduce((acc, item) => acc + item.value, 0)
      setValorSpecific(valorTotalSpecific)
      setExpensesData(expensesRes.data)
    }
  }


  const fetchData = async () => {
    try {
      const startDateStr = format(dataInicio, 'dd_MM_yyyy');
      const endDateStr = format(dataFinal, 'dd_MM_yyyy');

      const [revenueRes, profitRes, aircrafts, employees] = await Promise.all([
        axios.get(`/api/receita_por_aeronave/${startDateStr}/${endDateStr}/`),
        axios.get(`/api/lucro_por_aeronave/${startDateStr}/${endDateStr}/`),
        axios.get(`/api/aircraft/`),
        axios.get(`/api/employees/`)
      ])

      setEmployees(employees.data)
      setRevenueData(revenueRes.data)
      setProfitData(profitRes.data)
      setAircrafts(aircrafts.data)


      const expensesAircraft = await axios.get(`/api/expenses_aircraft/`);
      const expensesCommission = await axios.get(`/api/comissions/`);
      const expensesVehicle = await axios.get(`/api/expenses_vehicles/`);
      const expensesSpecific = await axios.get(`/api/expenses_specific/`);

      const safraStartDate = new Date(dataInicio)
      const safraEndDate = new Date(dataFinal)

      setExpenses({
        specific: expensesSpecific.data.filter((item) => {
          return new Date(item.data) >= safraStartDate && new Date(item.data) <= safraEndDate
        }),
        vehicle: expensesVehicle.data.filter((item) => {
          return new Date(item.data) >= safraStartDate && new Date(item.data) <= safraEndDate
        }),
        commission: expensesCommission.data.filter((item) => {
          return new Date(item.data) >= safraStartDate && new Date(item.data) <= safraEndDate
        }),
        aircraft: expensesAircraft.data.filter((item) => {
          return new Date(item.data) >= safraStartDate && new Date(item.data) <= safraEndDate
        }),
      });
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleAircraft = (nome: string) => {
    const selected = aircrafts?.filter((item) => {
      return item.registration === nome
    })

    setSelectedAircraft(selected[0].registration)
    setSelectedAircraftId(selected[0]?.id)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#4B5320] p-2 rounded shadow-md">
          <p className="text-white">{`Data: ${label}`}</p>
          <p className="text-white">{`Valor: R$ ${Number(payload[0].value).toFixed(2)}`}</p>
        </div>
      )
    }

    return null
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
    const aircraft = expenses['aircraft'].filter(e => !selectedAircraftId || e.aircraft_id === selectedAircraftId)
    const commission = expenses['commission'].filter(e => !selectedAircraftId || e.aircraft_id === selectedAircraftId)
    const vehicle = expenses['vehicle'].filter(e => !selectedAircraftId || e.aircraft_id === selectedAircraftId)
    const specific = expenses['specific'].filter(e => !selectedAircraftId || e.aircraft_id === selectedAircraftId)
    return {
      Aeronave: aircraft,
      Comissão: commission,
      Veículo: vehicle,
      Específico: specific,
      Total: [...aircraft, ...commission, ...vehicle, ...specific]
    }
  }, [expenses, selectedAircraft])

  const filteredExpensesTotal = useMemo(() => {
    const aircraft = expenses['aircraft']
    const commission = expenses['commission']
    const vehicle = expenses['vehicle']
    const specific = expenses['specific']
    return {
      Aeronave: aircraft,
      Comissão: commission,
      Veículo: vehicle,
      Específico: specific,
      Total: [...aircraft, ...commission, ...vehicle, ...specific]
    }
  }, [expenses])

  const filteredExpensesPiloto = useMemo(() => {
    let data = {};

    expenses['commission'].forEach((item) => {
      if (data[item.employee_id]) {
        data[item.employee_id].push(item);
      } else {
        data[item.employee_id] = [item];
      }
    });

    return data;

  }, [expenses])

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
              {aircrafts?.map((item) => (
                <SelectItem key={item.registration} value={item.registration}>{item.registration}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
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

        {expensesData.length > 0 && (
          <Card className="bg-[#556B2F]">
            <CardHeader>
              <CardTitle className='text-white'>Despesas Detalhadas - Total:R$ {valorSpecific.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={expensesData}>
                  <XAxis
                    dataKey="date"
                    stroke='white'
                    tick={{ fill: 'white' }}
                  />
                  <YAxis
                    stroke='white'
                    tick={{ fill: 'white' }}
                    tickFormatter={formatYAxis}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ color: 'white' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="white"
                    name="Valor"
                    dot={{ stroke: 'white', strokeWidth: 2, fill: '#556B2F' }}
                    activeDot={{ r: 8, stroke: 'white', strokeWidth: 2, fill: '#4B5320' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {aircraftReport.nome_aeronave !== 'Nenhuma aeronave selecionada.' && <Card className="bg-[#556B2F]">
          <CardHeader>
            <CardTitle className='text-white'>Despesas Gerais da Aeronave: {aircraftReport.nome_aeronave}</CardTitle>
          </CardHeader>
          <CardContent className='text-white'>
            {balanceData && aircraftReport && (
              <>
                <p>Receita Total: R$ {Number(balanceData.total_valor_area).toLocaleString()}</p>
                <p>Despesas Totais: R$ {Number(balanceData.total_despesas).toLocaleString()}</p>
                <p>Lucro Líquido: R$ {Number(balanceData.lucro_liquido).toLocaleString()}</p>
                <p>Total Gasto com Combustível: R$ {Number(balanceData.total_combustivel_gasto_na_area).toLocaleString()}</p>
                <p>Total Gasto com Óleo: R$ {Number(balanceData.total_oleo_gasto).toLocaleString()}</p>
              </>
            )}
          </CardContent>
        </Card>}

        {aircraftReport && (
          <Card className="bg-[#556B2F]">
            <CardHeader>
              <CardTitle className='text-white'>Relatório da Aeronave: {aircraftReport.nome_aeronave}</CardTitle>
            </CardHeader>
            <CardContent className='text-white'>
              <p>Área Total Aplicada (Alqueires): {aircraftReport.total_de_area_aplicada_em_alqueires}</p>
              <p>Área Total Aplicada (Hectares): {aircraftReport.total_de_area_aplicada_em_hectares}</p>
              <p>Total de Horas Voadas: {aircraftReport.total_de_horas_voadas}</p>
              <p>Valor médio por alqueires: {aircraftReport.valor_medio_de_alqueires_total}</p>
              <p>Valor médio por hectares: {aircraftReport.valor_medio_de_hectares_total}</p>
              <p>Valor Médio por Hora de Voo: R$ {aircraftReport.valor_medio_por_hora_de_voo_total.toLocaleString()}</p>
              <p>Valor Total Bruto: R$ {Number(aircraftReport.valor_total_bruto_recebido).toLocaleString()}</p>
              <p>Comissões de Pilotos: {aircraftReport.comissoes_de_pilotos}</p>
              <p>Comissões de Auxiliar de pista: {aircraftReport.comissoes_de_badeco}</p>

              <p>Despesa Total: R$ {
                (Number(aircraftReport.valor_total_bruto_recebido) -
                  Number(aircraftReport.lucro_total)).toLocaleString()
              }</p>
              <p>Lucro Total: R$ {Number(aircraftReport.lucro_total).toLocaleString()}</p>
            </CardContent>
          </Card>
        )}


        <Card className="bg-[#556B2F]">
          <CardHeader>
            <CardTitle className='text-white'>Despesas por Categoria - Avião: {aircraftReport.nome_aeronave}</CardTitle>
          </CardHeader>
          {aircraftReport.nome_aeronave !== 'Nenhuma aeronave selecionada.' && <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesByType}>
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
          </CardContent>}
        </Card>

        <Card className="bg-[#556B2F]">
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
        </Card>



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