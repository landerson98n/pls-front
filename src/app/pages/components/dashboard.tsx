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
  const [selectedAircraft, setSelectedAircraft] = useState("")
  const [selectedAircraftId, setSelectedAircraftId] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("")

  const { data: aircrafts, isLoading: aircraftsLoad } = useQuery<aircraft[]>({
    queryKey: ['aircrafts'],
    queryFn: async () => {
      const response = await axios.get(`/api/aircraft/`);
      return response.data as aircraft[]
    },
    enabled: !!selectedSafra,
    initialData: [],
    refetchInterval: 15000
  })

  const { data: employees, isLoading: employeesLoad } = useQuery<employees[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await axios.get(`/api/employees/`);
      return response.data as employees[]
    },
    enabled: !!selectedSafra,
    initialData: [],
    refetchInterval: 15000
  })

  
  const handleAircraft = (nome: string) => {
    const selected = aircrafts?.filter((item) => {
      return item.registration === nome
    })
    router.push(`/pages/dashboard/${selected[0]?.id}`)
    setSelectedAircraft(selected[0].registration)
    setSelectedAircraftId(selected[0]?.id)
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
              {employees?.map((item) => { return item.role === "Piloto" && <SelectItem value={item.id.toString()}>{item.name}</SelectItem> }
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}