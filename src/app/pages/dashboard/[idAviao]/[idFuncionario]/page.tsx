'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useContext } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { useParams } from "next/navigation";
import { SafraContext } from "@/app/pages/utils/context/safraContext";

export default function Page() {
    const { selectedSafra } = useContext(SafraContext)
    const { idAviao, idFuncionario } = useParams()

    const { data: expensesData, isLoading: balanceDataLoad } = useQuery<{date: Date, value: number}[]>({
        queryKey: ['despesas_por_categoria_especifica'],
        queryFn: async () => {
            const response = await axios.get(`/api/despesas_por_categoria_especifica/${selectedSafra.dataInicio}/${selectedSafra.dataFinal}/${idAviao}/${idFuncionario}`)
            return response.data
        },
        initialData: []
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
                    <p className="text-white">{`Data: ${label}`}</p>
                    <p className="text-white">{`Valor: R$ ${Number(payload[0].value).toFixed(2)}`}</p>
                </div>
            )
        }

        return null
    }

    return (
        <div className="space-y-6">
            {expensesData.length > 0 && (
                <Card className="bg-[#556B2F]">
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
            )}
        </div>)
}