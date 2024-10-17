import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Caminho para a configuração do Prisma

// POST - Criar funcionário
export async function POST(req) {
    try {
        const data = await req.json();
        const { name, role } = data;

        // Verifique se o funcionário já existe
        const existingEmployee = await prisma.employees.findUnique({
            where: { name },
        });

        if (existingEmployee) {
            return NextResponse.json({ error: "Employee with this name already exists" }, { status: 400 });
        }

        const newEmployee = await prisma.employees.create({
            data: { name, role },
        });

        return NextResponse.json({ message: "Employee created successfully", employee: newEmployee }, { status: 201 });
    } catch (error) {
        console.error('Erro ao criar funcionário:', error);
        return NextResponse.json({ error: 'Erro ao criar o funcionário' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const employees = await prisma.employees.findMany();
        return NextResponse.json(employees, { status: 200 });
    } catch (error) {
        console.error('Erro ao buscar funcionários:', error);
        return NextResponse.json({ error: 'Erro ao buscar funcionários' }, { status: 500 });
    }
}
