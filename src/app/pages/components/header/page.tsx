'use client'
import { SafraContext } from '@/app/pages/utils/context/safraContext'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { toast } from '@/hooks/use-toast'
import { safras } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Menu } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Header() {

    const route = useRouter()
    const { data: safras, isLoading: safrasLoad } = useQuery<safras[]>({
        queryKey: ['safras'],
        queryFn: async () => {
            const response = await axios.get(`/api/safras/`);
            setSelectedSafra(response.data[0])
            return response.data as safras[]
        },
        initialData: [],
        refetchInterval: 50000
    })
    const [activeComponent, setActiveComponent] = useState('dashboard')
    const { selectedSafra, setSelectedSafra } = useContext(SafraContext)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

    const handleLogout = () => {
        localStorage.setItem('token', '')
        route.push('/')
    }
    const [user, setUser] = useState<string>('')

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('token') || JSON.stringify(''))
        setUser(data.user)
    }, [])


    const handleSelectSafra = (id: string) => {
        const safra = safras.find((item) => item.id === id)
        if (safra) {
            setSelectedSafra(safra)
        }
    }

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
                        route.push(`/pages/${item.key}`)
                        onClick()
                    }}
                >
                    {item.name}
                </a>
            ))}
        </>
    )

    return (
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
                        <span>{user?.name}</span>
                        <Button variant="ghost" onClick={handleLogout}>
                            Sair
                        </Button>
                    </div>
                    <Sheet open={isMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent onClick={() => setIsMobileMenuOpen(false)} side="right" className="w-[300px] sm:w-[400px] bg-[#556B2F]">
                            <nav className="mt-6 text-white">
                                <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
                                <div className="mt-4 px-4">
                                    <span className="block text-sm mb-2">{user?.name}</span>
                                    <Button variant="outline" onClick={handleLogout} className="w-full text-black">
                                        Sair
                                    </Button>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}