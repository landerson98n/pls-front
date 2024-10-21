'use client'

import React, { useEffect, useState } from 'react'
import { Airplay, Bell, ChevronDown, Frame, Plane, Menu, X, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RegisterService } from '@/components/register-service'
import { RegisterExpense } from '@/components/expense-filter'
import { RegisterEmployee } from '@/components/register-employee'
import { RegisterAircraft } from '@/components/register-aircraft'
import { ServiceList } from '@/components/service-list'
import { ExpenseList } from '@/components/expense-list'
import { DashboardPage } from '@/components/dashboard'
import { SafraManagement } from '@/components/safra-management'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import axios from 'axios'
import { Login } from '@/components/login'

type Safra = {
  id: string;
  dataInicio: string;
  dataFinal: string;
  label: string;
}

export default function Dashboard() {
  const [activeComponent, setActiveComponent] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedSafra, setSelectedSafra] = useState<Safra>({ id: '', dataInicio: '', dataFinal: '', label: '' })
  const [safras, setSafras] = useState<Safra[]>([])
  const [loadSafra, setLoadSafra] = useState<Safra[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<string | null>(null)

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/login', { email, password })

      if (response.status === 200) {
        localStorage.setItem('token', JSON.stringify(response.data))
        setIsAuthenticated(true)
        setUser(response.data.user)

        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo, ${response.data.user.name}!`,
        })
      }
    } catch (error) {
      console.error('Erro de login:', error)

      toast({
        title: "Erro de autenticação",
        description: error.response?.data?.message || "Email ou senha incorretos.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.setItem('token', '')
    setActiveComponent('dashboard')
  }

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'register':
        return <RegisterService selectedSafra={selectedSafra} />
      case 'expenses':
        return <RegisterExpense selectedSafra={selectedSafra} />
      case 'employees':
        return <RegisterEmployee />
      case 'aircraft':
        return <RegisterAircraft />
      case 'list-expenses':
        return <ExpenseList selectedSafra={selectedSafra} />
      case 'services':
        return <ServiceList selectedSafra={selectedSafra} />
      case 'safras':
        return <SafraManagement setLoadSafra={setLoadSafra} />
      case 'dashboard':
      default:
        return <DashboardPage selectedSafra={selectedSafra} />
    }
  }

  const navItems = [
    { name: 'Dashboard', key: 'dashboard' },
    { name: 'Registrar', key: 'register' },
    { name: 'Listar Serviços', key: 'services' },
    { name: 'Aeronaves', key: 'aircraft' },
    { name: 'Despesas', key: 'expenses' },
    { name: 'Funcionários', key: 'employees' },
    { name: 'Listar Despesas', key: 'list-expenses' },
    { name: 'Gerenciar Safras', key: 'safras' },
  ]

  const NavLinks = ({ onClick = () => { } }) => (
    <>
      {navItems.map((item) => (
        <a
          key={item.key}
          href="#"
          className={`block py-2 px-4 text-white hover:bg-black ${activeComponent === item.key ? 'bg-black font-semibold' : ''
            }`}
          onClick={() => {
            setActiveComponent(item.key)
            onClick()
          }}
        >
          {item.name}
        </a>
      ))}
    </>
  )

  useEffect(() => {
    fetchSafras()
  }, [loadSafra])

  const fetchSafras = async () => {
    try {
      const response = await axios.get('/api/safras')
      setSafras(response.data)
      if (response.data.length > 0) {
        setSelectedSafra(response.data[0])
      }
    } catch (error) {
      console.error('Error fetching safras:', error)
      toast({
        title: "Erro ao carregar safras",
        description: "Não foi possível carregar as safras. Por favor, tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleSelectSafra = (id: string) => {
    const safra = safras.find((item) => item.id === id)
    if (safra) {
      setSelectedSafra(safra)
    }
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="flex flex-col h-screen bg-white lg:flex-row">
      {/* Sidebar for larger screens */}
      <aside className="hidden lg:block w-64 bg-[#556B2F] shadow-md">
        <div className="p-4 flex items-center gap-2">
          <Plane className="w-8 h-8 text-white" />
          <span className="text-xl font-bold text-white">PLS</span>
        </div>
        <nav className="mt-6 text-white">
          <NavLinks />
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl  mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className='w-full sm:w-[30%] flex items-center gap-2'>
              <Select value={selectedSafra.id} onValueChange={handleSelectSafra}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a safra" />
                </SelectTrigger>
                <SelectContent>
                  {safras.map((safra) => (
                    <SelectItem key={safra.id} value={safra.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{safra.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <span>{user.name}</span>
                <Button variant="ghost" onClick={handleLogout}>
                  Sair
                </Button>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-[#556B2F]">
                  <nav className="mt-6 text-white">
                    <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="mt-4 px-4">
                      <span className="block text-sm mb-2">{user.name}</span>
                      <Button variant="outline" onClick={handleLogout} className="w-full">
                        Sair
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {renderActiveComponent()}
        </div>
      </main>
    </div>
  )
}