'use client'
import { DashboardPage } from "../components/dashboard";

export default function Dashboard({ children }) {
    return (
        <DashboardPage>
            {children}
        </DashboardPage>
    )
}