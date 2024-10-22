'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import axios from 'axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useContext, useEffect, useMemo, useState } from 'react'
import { SafraContext } from '../utils/context/safraContext'
import { employees, expenses } from '@prisma/client'


export default function Dashboard() {
    const { selectedSafra } = useContext(SafraContext);
    const [dataInicio, setStartDate] = useState<Date>()
    const [dataFinal, setEndDate] = useState<Date>()

    const safraStartDate = new Date(dataInicio)
    const safraEndDate = new Date(dataFinal)
    const queryClient = useQueryClient()

    useEffect(() => {
        setStartDate(selectedSafra.dataInicio)
        setEndDate(selectedSafra.dataFinal)
    }, [selectedSafra])

    const { data: expenses_aircraft, isLoading: expenses_aircraftLoad, refetch: refetchAir } = useQuery<expenses[]>({
        queryKey: ['expenses_aircraft'],
        queryFn: async () => {
            const response = await axios.get(`/api/expenses_aircraft/`);
            return response.data.filter((item) => {
                return new Date(item.data) >= safraStartDate && new Date(item.data) <= safraEndDate
            }) as expenses[]
        },
        initialData: [],
    })
    
    const { data: comissions, isLoading: comissionstLoad, refetch: refetchComm } = useQuery<expenses[]>({
        queryKey: ['comissions'],
        queryFn: async () => {
            const response = await axios.get(`/api/comissions/`);
            return response.data.filter((item) => {
                return new Date(item.data) >= safraStartDate && new Date(item.data) <= safraEndDate
            }) as []
        },
        initialData: [],
    })

    const { data: expenses_vehicles, isLoading: expenses_vehiclesLoad , refetch: refetchVeh} = useQuery<expenses[]>({
        queryKey: ['expenses_vehicles'],
        queryFn: async () => {
            const response = await axios.get(`/api/expenses_vehicles/`);
            return response.data.filter((item) => {
                return new Date(item.data) >= safraStartDate && new Date(item.data) <= safraEndDate
            }) as []
        },
        initialData: [],
    })

    const { data: expenses_specific, isLoading: expenses_specificLoad, refetch: refetchSpe } = useQuery<expenses[]>({
        queryKey: ['expenses_specific'],
        queryFn: async () => {
            const response = await axios.get(`/api/expenses_specific/`);
            return response.data.filter((item) => {
                return new Date(item.data) >= safraStartDate && new Date(item.data) <= safraEndDate
            }) as []
        },
        initialData: [],
    })

    useEffect(() => {
        refetchAir();
        refetchSpe();
        refetchComm();
        refetchVeh();
    }, [selectedSafra, dataInicio, dataFinal]);
    const employees = () => {
        return queryClient.getQueryData<employees[]>(['employees']) || []
    }

    const formatTooltipValue = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

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


    const expensesByTypeTotal = useMemo(() => {
        return Object.entries(filteredExpensesTotal).map(([type, expenses]) => {
            return {
                name: type,
                value: expenses.reduce((sum, expense) => sum + Number(expense.valor), 0)
            }
        })
    }, [filteredExpensesTotal])


    const getEmployeeNameById = (id) => {
        const employee = employees()?.find(emp => emp.id === Number(id));
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

    const formatYAxis = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`
        }
        return value.toFixed(0)
    }

    return (
        <div className="space-y-6">
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
                                {expensesByTypePiloto.map((entry, index) => (
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
                                {expensesByTypeTotal.map((entry, index) => (
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