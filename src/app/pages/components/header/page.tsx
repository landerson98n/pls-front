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

export default function Header() {

    const { data: safras, isLoading: safrasLoad } = useQuery<safras[]>({
        queryKey: ['safras'],
        queryFn: async () => {
            const response = await axios.get(`/api/safras/`);
            return response.data as safras[]
        },
        initialData: [],
        refetchInterval: 5000
    })

    const { selectedSafra, setSelectedSafra } = useContext(SafraContext)

    const handleLogout = () => {
        localStorage.setItem('token', '')
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

    if (safrasLoad) {
        return
    }

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
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-[#556B2F]">
                            <nav className="mt-6 text-white">
                                {/* <NavLinks onClick={() => setIsMobileMenuOpen(false)} /> */}
                                <div className="mt-4 px-4">
                                    <span className="block text-sm mb-2">{user?.name}</span>
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
    )
}