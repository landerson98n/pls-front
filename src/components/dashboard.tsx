'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts'
import { format } from 'date-fns'
import axios from 'axios'

type Safra = {
  id: string;
  startDate: string;
  endDate: string;
  label: string;
}

export function DashboardPage({ selectedSafra }: { selectedSafra: Safra }) {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [selectedAircraft, setSelectedAircraft] = useState("")
  const [selectedAircraftId, setSelectedAircraftId] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [aircraftReport, setAircraftReport] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [profitData, setProfitData] = useState<any[]>([])
  const [balanceData, setBalanceData] = useState<any>(null)
  const [expensesData, setExpensesData] = useState<any[]>([])
  const [aircrafts, setAircrafts] = useState<any[]>()
  const [employees, setEmployees] = useState<any[]>()

  useEffect(() => {
    fetchData()
  }, [startDate, endDate, selectedEmployee])

  useEffect(() => {
    setStartDate(selectedSafra.startDate)
    setEndDate(selectedSafra.endDate)
  }, [selectedSafra])

  useEffect(() => {
    fetchDataSpecific()
  }, [selectedAircraftId, selectedEmployee, startDate, endDate])

  const fetchDataSpecific = async () => {
    const startDateStr = startDate && format(startDate, 'dd_MM_yyyy');
    const endDateStr = startDate && format(endDate, 'dd_MM_yyyy');

    if (selectedAircraftId) {
      const aircraftReportRes = await axios.get(`/api/gerar_relatorio_da_aeronave/${startDateStr}/${endDateStr}/${selectedAircraftId}/`)
      setAircraftReport(aircraftReportRes.data)

    }

    if (selectedEmployee && selectedAircraftId) {
      const expensesRes = await axios.get(`/api/despesas_por_categoria_especifica/${startDateStr}/${endDateStr}/${selectedEmployee}/${selectedAircraftId}/`)
      setExpensesData(expensesRes.data)
    }
  }


  const fetchData = async () => {
    try {
      const startDateStr = format(startDate, 'dd_MM_yyyy');
      const endDateStr = format(endDate, 'dd_MM_yyyy');

      const [revenueRes, profitRes, balanceRes, aircrafts, employees] = await Promise.all([
        axios.get(`/api/receita_por_aeronave/${startDateStr}/${endDateStr}/`),
        axios.get(`/api/lucro_por_aeronave/${startDateStr}/${endDateStr}/`),
        axios.get(`/api/gerar_balanco/${startDateStr}/${endDateStr}/`),
        axios.get(`/api/aircraft/`),
        axios.get(`/api/employees/`)
      ])

      console.log(revenueRes);

      setEmployees(employees.data)
      setRevenueData(revenueRes.data)
      setProfitData(profitRes.data)
      setBalanceData(balanceRes.data)
      setAircrafts(aircrafts.data)


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
          <p className="text-white">{`Data: ${format(label, 'dd/MM/yyyy')}`}</p>
          <p className="text-white">{`Valor: R$ ${payload[0].value.toFixed(2)}`}</p>
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

  const formattedData = revenueData.map(item => ({
    ...item,
    total_valor_total_da_area: Number(item.total_valor_total_da_area)
  }))

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
              {revenueData.map((item) => (
                <SelectItem key={item.aircraft_name} value={item.aircraft_name}>{item.aircraft_name}</SelectItem>
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
              <CardTitle className='text-white'>Despesas Detalhadas</CardTitle>
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

        {aircraftReport && (
          <Card className="bg-[#556B2F]">
            <CardHeader>
              <CardTitle className='text-white'>Relatório da Aeronave: {aircraftReport.nome_aeronave}</CardTitle>
            </CardHeader>
            <CardContent className='text-white'>
              <p>Área Total Aplicada (Hectares): {aircraftReport.total_de_area_aplicada_em_hectares}</p>
              <p>Área Total Aplicada (Alqueires): {aircraftReport.total_de_area_aplicada_em_alqueires}</p>
              <p>Valor Total Bruto: R$ {Number(aircraftReport.valor_total_bruto_recebido).toLocaleString()}</p>
              <p>Lucro Total: R$ {Number(aircraftReport.lucro_total).toLocaleString()}</p>
              <p>Total de Horas Voadas: {aircraftReport.total_de_horas_voadas}</p>
              <p>Valor Médio por Hora de Voo: R$ {aircraftReport.valor_medio_por_hora_de_voo_total.toLocaleString()}</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-[#556B2F]">
          <CardHeader>
            <CardTitle className='text-white'>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className='text-white'>
            {balanceData && (
              <>
                <p>Receita Total: R$ {Number(balanceData.total_valor_area).toLocaleString()}</p>
                <p>Despesas Totais: R$ {Number(balanceData.total_despesas).toLocaleString()}</p>
                <p>Lucro Líquido: R$ {Number(balanceData.lucro_liquido).toLocaleString()}</p>
                <p>Total Gasto com Combustível: R$ {Number(balanceData.total_combustivel_gasto_na_area).toLocaleString()}</p>
                <p>Total Gasto com Óleo: R$ {Number(balanceData.total_oleo_gasto).toLocaleString()}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#556B2F]">
          <CardHeader>
            <CardTitle className='text-white'>Receita por Aeronave</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData}>
                <XAxis
                  dataKey="aircraft_name"
                  tick={{ fill: 'white' }}
                />
                <YAxis
                  tick={{ fill: 'white' }}
                  tickFormatter={formatYAxis}
                />
                <Tooltip
                  formatter={(value: number) => [formatTooltipValue(value), "Receita"]}
                  labelStyle={{ color: 'black' }}
                  contentStyle={{ backgroundColor: '#4B5320', border: 'none' }}
                />
                <Legend
                  wrapperStyle={{ color: 'white' }}
                />
                <Bar
                  dataKey="total_valor_total_da_area"
                  fill="#82ca9d"
                  name="Receita"
                  label={{
                    position: 'top',
                    fill: 'white',
                    formatter: (value: number) => formatTooltipValue(value)
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#556B2F]">
          <CardHeader>
            <CardTitle className='text-white'>Lucro por Aeronave</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitData}>
                <XAxis dataKey="aircraft_name" tick={{ fill: 'white' }} />
                <YAxis tick={{ fill: 'white' }} tickFormatter={formatYAxis} />
                <Tooltip
                  formatter={(value: number) => [formatTooltipValue(value), "Lucro"]}
                  labelStyle={{ color: 'white' }}
                  contentStyle={{ backgroundColor: '#4B5320', border: 'none' }}
                />
                <Legend />
                <Bar
                  dataKey="lucro_por_area"
                  fill="#8884d8"
                  name="Lucro"
                  label={{
                    position: 'top',
                    fill: 'white',
                    formatter: (value: number) => formatTooltipValue(value)
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}