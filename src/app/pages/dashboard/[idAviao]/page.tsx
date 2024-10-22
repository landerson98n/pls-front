'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import axios from "axios";
import { Suspense, useContext, useMemo } from "react";
import { ResponsiveContainer } from "recharts"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { SafraContext } from "../../utils/context/safraContext";
import { useParams } from "next/navigation";
import { expenses } from "@prisma/client";

export default function Page() {
    const { selectedSafra } = useContext(SafraContext)
    const { idAviao } = useParams()
    const queryClient = useQueryClient();

    const { data: balanceData, isLoading: balanceDataLoad } = useQuery<[]>({
        queryKey: ['gerar_balanco'],
        queryFn: async () => {
            const response = await axios.get(`/api/gerar_balanco/${selectedSafra.dataInicio}/${selectedSafra.dataFinal}/${idAviao}`)
            return response.data as []
        },
        initialData: [],
        
    })

    const { data: aircraftReport, isLoading: aircraftReportLoad } = useQuery<[]>({
        queryKey: ['gerar_relatorio_da_aeronave'],
        queryFn: async () => {
            const response = await axios.get(`/api/gerar_relatorio_da_aeronave/${selectedSafra.dataInicio}/${selectedSafra.dataFinal}/${idAviao}`)
            return response.data as []
        },
        initialData: [],
        
    })

    const expenses_aircraft = () => {
        const commissionsData = queryClient.getQueryData<expenses[]>(['expenses_aircraft']);
        if (!commissionsData) return [];

        return commissionsData?.filter((item) => {
            return (
                item.aircraft_id === Number(idAviao)
            );
        });
    };

    const comissions = () => {
        const commissionsData = queryClient.getQueryData<expenses[]>(['comissions']);
        if (!commissionsData) return [];

        return commissionsData?.filter((item) => {
            return (
                item.aircraft_id === Number(idAviao)
            );
        });
    };

    const expenses_vehicles = () => {
        const commissionsData = queryClient.getQueryData<expenses[]>(['expenses_vehicles']);
        if (!commissionsData) return [];

        return commissionsData?.filter((item) => {
            return (
                item.aircraft_id === Number(idAviao)
            );
        });
    };

    const expenses_specific = () => {
        const commissionsData = queryClient.getQueryData<expenses[]>(['expenses_specific']);
        if (!commissionsData) return [];

        return commissionsData?.filter((item) => {
            return (
                item.aircraft_id === Number(idAviao)
            );
        });
    };

    const filteredExpenses = useMemo(() => {
        const aircraft = expenses_aircraft()
        const commission = comissions()
        const vehicle = expenses_vehicles()
        const specific = expenses_specific()

        return {
            Aeronave: aircraft,
            Comissão: commission,
            Veículo: vehicle,
            Específico: specific,
            Total: [...aircraft, ...commission, ...vehicle, ...specific]
        }
    }, [idAviao])

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


    return (
            <div className="space-y-6">
                <Card className="bg-[#556B2F]">
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
                </Card>


                {aircraftReport.nome_aeronave && <Card className="bg-[#556B2F]">
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
                </Card>}


                <Card className="bg-[#556B2F]">
                    <CardHeader>
                        <CardTitle className='text-white'>Despesas por Categoria - Avião: {aircraftReport.nome_aeronave}</CardTitle>
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