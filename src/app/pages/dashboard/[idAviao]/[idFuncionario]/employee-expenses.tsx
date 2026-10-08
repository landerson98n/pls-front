'use client'

import { useState, useContext, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { useParams } from "next/navigation"
import { SafraContext } from "@/app/pages/utils/context/safraContext"
import { toDateKey, toPathDate } from "@/app/pages/utils/safraDate"

export default function Page() {
    const { selectedSafra } = useContext(SafraContext)
    const { idAviao, idFuncionario } = useParams()
    const safraInicio = toDateKey(selectedSafra?.dataInicio)
    const safraFim = toDateKey(selectedSafra?.dataFinal)
    const [startDate, setStartDate] = useState(safraInicio)
    const [endDate, setEndDate] = useState(safraFim)
    const pathStart = toPathDate(startDate)
    const pathEnd = toPathDate(endDate)

    useEffect(() => {
        setStartDate(safraInicio)
        setEndDate(safraFim)
    }, [selectedSafra?.id, safraInicio, safraFim])

    const { data: expensesData = [] } = useQuery<{ date: string, value: number }[]>({
        queryKey: ['despesas_por_categoria_especifica', pathStart, pathEnd, idAviao, idFuncionario],
        queryFn: async () => {
            const response = await axios.get(`/api/despesas_por_categoria_especifica/${pathStart}/${pathEnd}/${idFuncionario}/${idAviao}`)
            return Array.isArray(response.data) ? response.data : []
        },
        enabled: Boolean(pathStart && pathEnd && idAviao && idFuncionario)
    })

    const formatYAxis = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`
        }
        return value.toFixed(0)
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#4B5320] p-2 rounded shadow-md">
                    <p className="text-white">{`Valor: R$ ${Number(payload[0].value).toFixed(2)}`}</p>
                </div>
            )
        }

        return null
    }

    return (
        <div className="space-y-6 p-6 bg-[#556B2F] rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <h2 className="text-2xl font-bold text-white">Detalhes de Despesas</h2>
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
            </div>

            {expensesData.length > 0 ? (
                <Card className="bg-[#4B5320]">
                    <CardHeader>
                        <CardTitle className='text-white'>Despesas Detalhadas - Total: R$ {expensesData.reduce((acc, item) => acc + Number(item.value), 0).toLocaleString()}</CardTitle>
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
            ) : (
                <Card className="bg-[#4B5320]">
                    <CardContent>
                        <p className="text-white text-center py-4">Nenhum dado disponível para o período selecionado.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}