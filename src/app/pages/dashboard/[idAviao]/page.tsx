'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { ResponsiveContainer } from "recharts"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { SafraContext } from "../../utils/context/safraContext";
import { useParams } from "next/navigation";
import { expenses } from "@prisma/client";
import { isWithinRange, toDateKey, toPathDate } from "../../utils/safraDate";

async function fetchList(url: string) {
    const response = await axios.get(url)
    return Array.isArray(response.data) ? response.data : []
}

export default function Page() {
    const { selectedSafra } = useContext(SafraContext)
    const { idAviao } = useParams()
    const safraInicio = toDateKey(selectedSafra?.dataInicio)
    const safraFim = toDateKey(selectedSafra?.dataFinal)
    const [startDate, setStartDate] = useState(safraInicio)
    const [endDate, setEndDate] = useState(safraFim)
    const pathStart = toPathDate(startDate)
    const pathEnd = toPathDate(endDate)
    const aircraftId = Number(idAviao)

    useEffect(() => {
        setStartDate(safraInicio)
        setEndDate(safraFim)
    }, [selectedSafra?.id, safraInicio, safraFim])

    const { data: balanceData } = useQuery({
        queryKey: ['gerar_balanco', pathStart, pathEnd, idAviao],
        queryFn: async () => {
            const response = await axios.get(`/api/gerar_balanco/${pathStart}/${pathEnd}/${idAviao}`)
            return response.data
        },
        enabled: Boolean(pathStart && pathEnd && idAviao),
    })

    const { data: aircraftReport } = useQuery({
        queryKey: ['gerar_relatorio_da_aeronave', pathStart, pathEnd, idAviao],
        queryFn: async () => {
            const response = await axios.get(`/api/gerar_relatorio_da_aeronave/${pathStart}/${pathEnd}/${idAviao}`)
            return response.data
        },
        enabled: Boolean(pathStart && pathEnd && idAviao),
    })

    const { data: allAircraftExpenses = [] } = useQuery<expenses[]>({
        queryKey: ['dashboard', 'expenses_aircraft'],
        queryFn: () => fetchList('/api/expenses_aircraft/'),
    })

    const { data: allComissions = [] } = useQuery<expenses[]>({
        queryKey: ['dashboard', 'comissions'],
        queryFn: () => fetchList('/api/comissions/'),
    })

    const { data: allVehicleExpenses = [] } = useQuery<expenses[]>({
        queryKey: ['dashboard', 'expenses_vehicles'],
        queryFn: () => fetchList('/api/expenses_vehicles/'),
    })

    const { data: allSpecificExpenses = [] } = useQuery<expenses[]>({
        queryKey: ['dashboard', 'expenses_specific'],
        queryFn: () => fetchList('/api/expenses_specific/'),
    })

    const belongsToAircraft = (item: expenses) =>
        isWithinRange(item.data, startDate, endDate) && Number(item.aircraft_id) === aircraftId

    const expenses_aircraft = useMemo(
        () => allAircraftExpenses.filter(belongsToAircraft),
        [allAircraftExpenses, startDate, endDate, aircraftId]
    )
    const comissions = useMemo(
        () => allComissions.filter(belongsToAircraft),
        [allComissions, startDate, endDate, aircraftId]
    )
    const expenses_vehicles = useMemo(
        () => allVehicleExpenses.filter(belongsToAircraft),
        [allVehicleExpenses, startDate, endDate, aircraftId]
    )
    const expenses_specific = useMemo(
        () => allSpecificExpenses.filter(belongsToAircraft),
        [allSpecificExpenses, startDate, endDate, aircraftId]
    )

    const filteredExpenses = useMemo(() => {
        return {
            Aeronave: expenses_aircraft,
            Comissão: comissions,
            Veículo: expenses_vehicles,
            Específico: expenses_specific,
            Total: [...expenses_aircraft, ...comissions, ...expenses_vehicles, ...expenses_specific]
        }
    }, [expenses_aircraft, comissions, expenses_vehicles, expenses_specific])

    const expensesByType = useMemo(() => {
        return Object.entries(filteredExpenses).map(([type, expenses]) => {
            return {
                name: type,
                value: expenses.reduce((sum, expense) => sum + Number(expense.valor), 0)
            }
        })
    }, [filteredExpenses])

    const formatTooltipValue = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    const formatYAxis = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`
        }
        return value.toFixed(0)
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']
    const balance = balanceData && !balanceData.error ? balanceData : null
    const report = aircraftReport && !aircraftReport.error ? aircraftReport : null

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white text-black rounded px-2 py-1"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white text-black rounded px-2 py-1"
                />
            </div>

            <Card className="bg-[#556B2F]">
                <CardHeader>
                    <CardTitle className='text-white'>Despesas Gerais da Aeronave: {report?.nome_aeronave}</CardTitle>
                </CardHeader>
                <CardContent className='text-white'>
                    {balance && report && (
                        <>
                            <p>Receita Total: R$ {Number(balance.total_valor_area || 0).toLocaleString()}</p>
                            <p>Despesas Totais: R$ {Number(balance.total_despesas || 0).toLocaleString()}</p>
                            <p>Lucro Líquido: R$ {Number(balance.lucro_liquido || 0).toLocaleString()}</p>
                            <p>Total Gasto com Combustível: R$ {Number(balance.total_combustivel_gasto_na_area || 0).toLocaleString()}</p>
                            <p>Total Gasto com Óleo: R$ {Number(balance.total_oleo_gasto || 0).toLocaleString()}</p>
                        </>
                    )}
                </CardContent>
            </Card>


            {report?.nome_aeronave && <Card className="bg-[#556B2F]">
                <CardHeader>
                    <CardTitle className='text-white'>Relatório da Aeronave: {report.nome_aeronave}</CardTitle>
                </CardHeader>
                <CardContent className='text-white'>
                    <p>Área Total Aplicada (Alqueires): {report.total_de_area_aplicada_em_alqueires}</p>
                    <p>Área Total Aplicada (Hectares): {report.total_de_area_aplicada_em_hectares}</p>
                    <p>Total de Horas Voadas: {report.total_de_horas_voadas}</p>
                    <p>Valor médio por alqueires: {report.valor_medio_de_alqueires_total}</p>
                    <p>Valor médio por hectares: {report.valor_medio_de_hectares_total}</p>
                    <p>Valor Médio por Hora de Voo: R$ {Number(report.valor_medio_por_hora_de_voo_total || 0).toLocaleString()}</p>
                    <p>Valor Total Bruto: R$ {Number(report.valor_total_bruto_recebido).toLocaleString()}</p>
                    <p>Comissões de Pilotos: R$ {Number(report.comissoes_de_pilotos).toLocaleString()}</p>
                    <p>Comissões de Auxiliar de pista:R$ {Number(report.comissoes_de_badeco).toLocaleString()}</p>

                    <p>Despesa Total: R$ {
                        (Number(report.valor_total_bruto_recebido) -
                            Number(report.lucro_total)).toLocaleString()
                    }</p>
                    <p>Lucro Total: R$ {Number(report.lucro_total).toLocaleString()}</p>
                </CardContent>
            </Card>}


            <Card className="bg-[#556B2F]">
                <CardHeader>
                    <CardTitle className='text-white'>Despesas por Categoria - Avião: {report?.nome_aeronave}</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
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
                </CardContent>
            </Card>
        </div>
    )
}