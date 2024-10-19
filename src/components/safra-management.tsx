'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import axios from 'axios'
import { Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
type Safra = {
    id: string;
    dataInicio: string;
    dataFinal: string;
    label: string;
}

export function SafraManagement({ setLoadSafra }) {
    const [safras, setSafras] = useState<Safra[]>([])
    const [newSafra, setNewSafra] = useState<Omit<Safra, 'id'>>({ dataInicio: '', dataFinal: '', label: '' })
    const [editingSafra, setEditingSafra] = useState<Safra | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [load, setLoad] = useState(false)
    useEffect(() => {
        fetchSafras()
        setLoadSafra(safras)
    }, [isDialogOpen, editingSafra, newSafra, load])

    const fetchSafras = async () => {
        try {
            const response = await axios.get('/api/safras')
            setSafras(response.data)
        } catch (error) {
            console.error('Error fetching safras:', error)
            toast({
                title: "Erro ao carregar safras",
                description: "Não foi possível carregar as safras. Por favor, tente novamente.",
                variant: "destructive",
            })
        }
    }

    const handleCreateSafra = async () => {
        try {
            const response = await axios.post('/api/safras', newSafra)
            setSafras([...safras, response.data])
            setNewSafra({ dataInicio: '', dataFinal: '', label: '' })
            setIsDialogOpen(false)
            toast({
                title: "Safra criada",
                description: "A nova safra foi criada com sucesso.",
            })
        } catch (error) {
            console.error('Error creating safra:', error)
            toast({
                title: "Erro ao criar safra",
                description: "Não foi possível criar a safra. Por favor, tente novamente.",
                variant: "destructive",
            })
        }
    }

    const handleUpdateSafra = async () => {
        if (!editingSafra) return

        try {
            const response = await axios.put(`/api/safras/`, editingSafra)
            setSafras(safras.map(safra => safra.id === editingSafra.id ? response.data : safra))
            setEditingSafra(null)
            setIsDialogOpen(false)
            toast({
                title: "Safra atualizada",
                description: "A safra foi atualizada com sucesso.",
            })
        } catch (error) {
            console.error('Error updating safra:', error)
            toast({
                title: "Erro ao atualizar safra",
                description: "Não foi possível atualizar a safra. Por favor, tente novamente.",
                variant: "destructive",
            })
        }
    }

    const handleDeleteSafra = async (id: string) => {
        try {
            await axios.delete(`/api/safras/`, {
                data: {
                    id
                }
            })
            setSafras(safras.filter(safra => safra.id !== id))
            setLoad(!load)
            toast({
                title: "Safra excluída",
                description: "A safra foi excluída com sucesso.",
            })
        } catch (error) {
            console.error('Error deleting safra:', error)
            toast({
                title: "Erro ao excluir safra",
                description: "Não foi possível excluir a safra. Por favor, tente novamente.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="p-6 bg-[#556B2F] rounded-lg shadow-md text-white">
            <h2 className="text-2xl font-bold mb-4">Gerenciamento de Safras</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="mb-4">Adicionar Nova Safra</Button>
                </DialogTrigger>
                <DialogContent className="bg-[#4B5320] text-white">
                    <DialogHeader>
                        <DialogTitle>{editingSafra ? 'Editar Safra' : 'Adicionar Nova Safra'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="label" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="label"
                                value={editingSafra ? editingSafra.label : newSafra.label}
                                onChange={(e) => editingSafra ? setEditingSafra({ ...editingSafra, label: e.target.value }) : setNewSafra({ ...newSafra, label: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dataInicio" className="text-right">
                                Data Início
                            </Label>
                            <Input
                                id="dataInicio"
                                type="date"
                                value={editingSafra ? editingSafra.dataInicio : newSafra.dataInicio}
                                onChange={(e) => editingSafra ? setEditingSafra({ ...editingSafra, dataInicio: e.target.value }) : setNewSafra({ ...newSafra, dataInicio: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dataFinal" className="text-right">
                                Data Fim
                            </Label>
                            <Input
                                id="dataFinal"
                                type="date"
                                value={editingSafra ? editingSafra.dataFinal : newSafra.dataFinal}
                                onChange={(e) => editingSafra ? setEditingSafra({ ...editingSafra, dataFinal: e.target.value }) : setNewSafra({ ...newSafra, dataFinal: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <Button onClick={editingSafra ? handleUpdateSafra : handleCreateSafra}>
                        {editingSafra ? 'Atualizar' : 'Criar'}
                    </Button>
                </DialogContent>
            </Dialog>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Data Início</TableHead>
                        <TableHead>Data Fim</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {safras.map((safra) => (
                        <TableRow key={safra.id}>
                            <TableCell>{safra.label}</TableCell>
                            <TableCell>{typeof safra?.dataInicio === typeof Date() ? format(safra?.dataInicio, "dd/MM/yyyy") : ""}</TableCell>
                            <TableCell>{typeof safra?.dataFinal === typeof Date() ? format(safra?.dataFinal, "dd/MM/yyyy") : ""}</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setEditingSafra(safra)
                                    setIsDialogOpen(true)
                                }}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteSafra(safra.id)}>
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