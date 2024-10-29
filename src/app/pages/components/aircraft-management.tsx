'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import axios from 'axios'
import { Edit, Trash2 } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { aircraft } from '@prisma/client'

type Aircraft = {
    id: string;
    registration: string;
    model: string;
    brand: string;
}

export function AircraftManagement() {
    const queryClient = useQueryClient();
    const [newAircraft, setNewAircraft] = useState<Omit<Aircraft, 'id'>>({ registration: '', model: '', brand: '' })
    const [editingAircraft, setEditingAircraft] = useState<Aircraft | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const { data: aircrafts, isLoading: aircraftsLoad } = useQuery<aircraft[]>({
        queryKey: ['aircrafts'],
        queryFn: async () => {
            const response = await axios.get(`/api/aircraft/`);
            return response.data as aircraft[]
        },
        initialData: [],
        refetchInterval: 5000
    })

    const handleCreateAircraft = async () => {
        try {
            await axios.post('/api/aircraft', newAircraft)
            setNewAircraft({ registration: '', model: '', brand: '' })
            setIsDialogOpen(false)
            toast({
                title: "Aeronave criada",
                description: "A nova aeronave foi criada com sucesso.",
            })
            queryClient.refetchQueries()
        } catch (error) {
            if (error.status === 400) {
                return toast({
                    title: "Aeronave já cadastrada",
                    variant: "destructive",
                })
            }
            console.error('Error creating aircraft:', error)
            toast({
                title: "Erro ao criar aeronave",
                description: "Não foi possível criar a aeronave. Por favor, tente novamente.",
                variant: "destructive",
            })
        }
    }

    const handleUpdateAircraft = async () => {
        if (!editingAircraft) return

        try {
            await axios.put(`/api/aircraft/`, editingAircraft)
            setEditingAircraft(null)
            setIsDialogOpen(false)
            toast({
                title: "Aeronave atualizada",
                description: "A aeronave foi atualizada com sucesso.",
            })
            queryClient.refetchQueries()
        } catch (error) {
            console.error('Error updating aircraft:', error)
            toast({
                title: "Erro ao atualizar aeronave",
                description: "Não foi possível atualizar a aeronave. Por favor, tente novamente.",
                variant: "destructive",
            })
        }
    }

    const handleDeleteAircraft = async (id: string) => {
        try {
            await axios.delete(`/api/aircraft/`, {
                data: { id }
            })
            toast({
                title: "Aeronave excluída",
                description: "A aeronave foi excluída com sucesso.",
            })
            queryClient.refetchQueries()
        } catch (error) {
            console.error('Error deleting aircraft:', error)
            toast({
                title: "Erro ao excluir aeronave",
                description: "Não foi possível excluir a aeronave. Por favor, tente novamente.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="p-6 bg-[#556B2F] rounded-lg shadow-md text-white">
            <h2 className="text-2xl font-bold mb-4">Gerenciamento de Aeronaves</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="mb-4">Adicionar Nova Aeronave</Button>
                </DialogTrigger>
                <DialogContent className="bg-[#4B5320] text-white">
                    <DialogHeader>
                        <DialogTitle>{editingAircraft ? 'Editar Aeronave' : 'Adicionar Nova Aeronave'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="registration" className="text-right">
                                Registro
                            </Label>
                            <Input
                                id="registration"
                                value={editingAircraft ? editingAircraft.registration : newAircraft.registration}
                                onChange={(e) => editingAircraft ? setEditingAircraft({ ...editingAircraft, registration: e.target.value }) : setNewAircraft({ ...newAircraft, registration: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="model" className="text-right">
                                Modelo
                            </Label>
                            <Input
                                id="model"
                                value={editingAircraft ? editingAircraft.model : newAircraft.model}
                                onChange={(e) => editingAircraft ? setEditingAircraft({ ...editingAircraft, model: e.target.value }) : setNewAircraft({ ...newAircraft, model: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="brand" className="text-right">
                                Marca
                            </Label>
                            <Input
                                id="brand"
                                value={editingAircraft ? editingAircraft.brand : newAircraft.brand}
                                onChange={(e) => editingAircraft ? setEditingAircraft({ ...editingAircraft, brand: e.target.value }) : setNewAircraft({ ...newAircraft, brand: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <Button onClick={editingAircraft ? handleUpdateAircraft : handleCreateAircraft}>
                        {editingAircraft ? 'Atualizar' : 'Criar'}
                    </Button>
                </DialogContent>
            </Dialog>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Registro</TableHead>
                        <TableHead>Modelo</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {aircrafts.map((aircraft) => (
                        <TableRow key={aircraft.id}>
                            <TableCell>{aircraft.registration}</TableCell>
                            <TableCell>{aircraft.model}</TableCell>
                            <TableCell>{aircraft.brand}</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setEditingAircraft(aircraft)
                                    setIsDialogOpen(true)
                                }}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteAircraft(aircraft.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}