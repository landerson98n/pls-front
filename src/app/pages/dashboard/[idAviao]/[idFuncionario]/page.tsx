'use client'

import dynamic from 'next/dynamic'

const EmployeeExpenses = dynamic(() => import('./employee-expenses'), {
    ssr: false,
})

export default function Page() {
    return <EmployeeExpenses />
}
