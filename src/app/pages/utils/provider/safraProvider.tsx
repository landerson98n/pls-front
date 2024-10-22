'use client'
import { SafraContext } from "@/app/pages/utils/context/safraContext";
import { safras } from "@prisma/client";
import { useState } from "react";
export const SafraProvider = ({ children }) => {
    const [selectedSafra, setSelectedSafra] = useState<safras>({
        dataFinal: new Date(),
        dataInicio: new Date(),
        id: '',
        label: ''
    });
    return (
        <SafraContext.Provider value={{ selectedSafra, setSelectedSafra }}>
            {children}
        </SafraContext.Provider>
    )
}