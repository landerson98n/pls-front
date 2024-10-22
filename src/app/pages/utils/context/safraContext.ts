import { safras } from "@prisma/client";
import { createContext, Dispatch, SetStateAction } from "react";

export const SafraContext = createContext({
    selectedSafra: {} as safras,
    setSelectedSafra: {} as Dispatch<SetStateAction<{
        id: string;
        dataInicio: Date;
        dataFinal: Date;
        label: string;
    }>>
})
