'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import axios from 'axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useContext, useEffect, useMemo, useState } from 'react'
import { SafraContext } from '../utils/context/safraContext'
import { isWithinRange, toDateKey } from '../utils/safraDate'
import { employees, expenses } from '@prisma/client'

async function fetchList(url: string) {
    const response = await axios.get(url)
    return Array.isArray(response.data) ? response.data : []
}

export default function Dashboard() {
    const { selectedSafra } = useContext(SafraContext);
    const safraInicio = toDateKey(selectedSafra?.dataInicio)
    const safraFim = toDateKey(selectedSafra?.dataFinal)
    const [dataInicio, setStartDate] = useState(safraInicio)
    const [dataFinal, setEndDate] = useState(safraFim)
    const queryClient = useQueryClient()

    useEffect(() => {
        setStartDate(safraInicio)
        setEndDate(safraFim)
    }, [selectedSafra?.id, safraInicio, safraFim])

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

    const expenses_aircraft = useMemo(
        () => allAircraftExpenses.filter((item) => isWithinRange(item.data, dataInicio, dataFinal)),
        [allAircraftExpenses, dataInicio, dataFinal]
    )
    const comissions = useMemo(
        () => allComissions.filter((item) => isWithinRange(item.data, dataInicio, dataFinal)),
        [allComissions, dataInicio, dataFinal]
    )
    const expenses_vehicles = useMemo(
        () => allVehicleExpenses.filter((item) => isWithinRange(item.data, dataInicio, dataFinal)),
        [allVehicleExpenses, dataInicio, dataFinal]
    )
    const expenses_specific = useMemo(
        () => allSpecificExpenses.filter((item) => isWithinRange(item.data, dataInicio, dataFinal)),
        [allSpecificExpenses, dataInicio, dataFinal]
    )
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
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white text-black rounded px-2 py-1"
                />
                <input
                    type="date"
                    value={dataFinal}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white text-black rounded px-2 py-1"
                />
            </div>

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
                    <CardTitle className='text-white'>Despesas por Categoria</CardTitle>
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