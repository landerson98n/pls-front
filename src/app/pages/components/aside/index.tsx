'use client'
import { Plane } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Aside() {
    const route = useRouter()
    const [activeComponent, setActiveComponent] = useState('dashboard')

    const navItems = [
        { name: 'Dashboard', key: 'dashboard' },
        { name: 'Registrar', key: 'register' },
        { name: 'Listar Serviços', key: 'services' },
        { name: 'Aeronaves', key: 'aircraft' },
        { name: 'Despesas', key: 'expenses' },
        { name: 'Funcionários', key: 'employees' },
        { name: 'Listar Despesas', key: 'list-expenses' },
        { name: 'Gerenciar Safras', key: 'safras' },
        { name: 'Gerenciar Aeronaves', key: 'avioes' },
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
        <aside className="hidden lg:block w-64 bg-[#556B2F] shadow-md">
            <div className="p-4 flex items-center gap-2">
                <Plane className="w-8 h-8 text-white" />
                <span className="text-xl font-bold text-white">PLS</span>
            </div>
            <nav className="mt-6 text-white">
                <NavLinks />
            </nav>
        </aside>)
}