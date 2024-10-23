'use client'

import React, { useContext, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronDown, ChevronUp, Edit, Save, Trash2, X, Search, Filter, ChevronRight, ChevronsRight, ChevronLeft, ChevronsLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import axios from 'axios'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { expenses, services } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { SafraContext } from '@/app/pages/utils/context/safraContext'

type Service = {
  id: number
  data_inicio: string
  data_final: string | null
  solicitante_da_area: string
  nome_da_area: string
  tamanho_area_hectares: number
  tamanho_area_alqueires: number
  tipo_aplicacao_na_area: string
  quantidade_no_hopper_por_voo: number
  tipo_de_vazao: string
  quantidade_de_voos_na_area: number
  valor_por_alqueire: number
  valor_por_hectare: number
  valor_medio_por_hora_de_voo: number
  valor_total_da_area: number
  confirmacao_de_pagamento_da_area: string
  tempo_de_voo_gasto_na_area: string
  aeronave_id: number
  aeronave_data: string
  employee_id: number
  employee_data: string
  lucro_por_area: number
  percentual_de_lucro_liquido_por_area: number
  criado_em: string
  criado_por: string
}

type Expense = {
  id: number
  data: string
  origem: string
  porcentagem: number
  valor: number
  pagamento: string
  funcionario: string
  service_id: string
}

type Safra = {
  id: string;
  dataInicio: string;
  dataFinal: string;
  label: string;
}

export function ServiceList() {
  const { selectedSafra } = useContext(SafraContext);

  const [selectedServices, setSelectedServices] = useState<number[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [expandedRows, setExpandedRows] = useState<number[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [filters, setFilters] = useState<{ [key in keyof Service]?: string }>({})


  const { data: services, isLoading: servicesLoad, refetch: refetchServices } = useQuery<services[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await axios.get(`/api/services/`);
      return response.data as services[]
    },
    enabled: !!selectedSafra,
    initialData: [],

  })


  const { data: expenses, isLoading: expensesLoad } = useQuery<expenses[]>({
    queryKey: ['expenses'],
    queryFn: async () => {
      const response = await axios.get(`/api/expenses/`);
      return response.data as expenses[]
    },
    enabled: !!selectedSafra,
    initialData: [],

  })


  const filteredServices = services.filter(service => {
    const serviceDate = new Date(service.criado_em)
    const safraStartDate = new Date(selectedSafra.dataInicio)
    const safraEndDate = new Date(selectedSafra.dataFinal)

    const isWithinSafraDates = !selectedSafra ||
      (serviceDate >= safraStartDate && serviceDate <= safraEndDate)

    return isWithinSafraDates && Object.entries(filters).every(([key, value]) => {
      if (!value) return true
      const serviceValue = service[key as keyof Service]?.toString()
      return typeof serviceValue === 'string' && serviceValue.toLowerCase().includes(value.toLowerCase().toString())
    })
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedServices(services.map(service => service.id))
    } else {
      setSelectedServices([])
    }
  }

  const handleSelectService = (serviceId: number) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleDeleteSelected = async () => {
    try {
      await axios.delete('/api/services/', { data: { ids: selectedServices } })
      refetchServices()
      setSelectedServices([])
      toast({ title: "Serviços deletados com sucesso" })
    } catch (error) {
      toast({
        title: "Erro ao deletar os serviços",
        description: "Ocorreu um erro ao tentar deletar os serviços. Por favor, tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleEditService = (service: Service) => {
    setEditingId(service.id)
    setEditingService({ ...service })
  }

  const handleSaveEdit = async () => {
    if (editingService) {
      try {
        const token = JSON.parse(localStorage.getItem('token') || JSON.stringify(""))
        const response = await axios.put('/api/services', {
          data: {
            id: editingService.id,
            updatedData: {
              ...editingService,
              data_inicio: new Date(editingService.data_inicio),
              data_final: editingService.data_final ? new Date(editingService.data_final) : '',
              criado_por: token?.user?.id || 1,
            },
          }
        })

        if (response.status === 200) {
          refetchServices()
          toast({ title: 'Edição salva com sucesso!' })
          setEditingId(null)
          setEditingService(null)
        }
      } catch (error) {
        console.error('Erro ao atualizar serviço:', error)
        toast({ title: 'Erro ao salvar a edição. Tente novamente.', variant: 'destructive' })
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingService(null)
  }

  const handleDeleteService = async (serviceId: number) => {
    try {
      await axios.delete('/api/services/', { data: { ids: [serviceId] } })
      refetchServices()
      setSelectedServices([])
      toast({ title: "Serviço deletado com sucesso" })
    } catch (error) {
      console.error('Erro ao deletar o serviço', error)
      toast({
        title: "Erro ao deletar o serviço",
        description: "Ocorreu um erro ao tentar deletar o serviço. Por favor, tente novamente.",
        variant: "destructive",
      })
    }
  }

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Service) => {
    const { value } = e.target
    setEditingService(prev => {
      if (prev) {
        return { ...prev, [field]: field === 'valor_total_da_area' || field === 'tamanho_area_hectares' || field === 'tamanho_area_alqueires' ? parseFloat(value) : value }
      }
      return null
    })
  }

  const renderEditableCell = (service: Service, field: keyof Service) => {
    if (editingId === service.id) {
      if (field === 'confirmacao_de_pagamento_da_area') {
        return (
          <Select
            value={editingService?.[field] || ''}
            onValueChange={(value) => setEditingService(prev => prev ? { ...prev, [field]: value } : null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pago">Pago</SelectItem>
              <SelectItem value="Em Aberto">Em Aberto</SelectItem>
            </SelectContent>
          </Select>
        )
      } else if (field === 'tipo_aplicacao_na_area') {
        return <Select onValueChange={(value) => setEditingService(prev => prev ? { ...prev, [field]: value } : null)} value={editingService?.[field] || ''}>
          <SelectTrigger id="tipo_aplicacao_na_area">
            <SelectValue placeholder="Selecione o tipo de aplicação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semente">Semente</SelectItem>
            <SelectItem value="liquido">Liquido</SelectItem>
            <SelectItem value="nenhum">Nenhum</SelectItem>
          </SelectContent>
        </Select>
      } else {
        return (
          <Input
            value={editingService?.[field] || ''}
            onChange={(e) => handleEditInputChange(e, field)}
            type={field === 'valor_total_da_area' || field === 'tamanho_area_hectares' || field === 'tamanho_area_alqueires' ? 'number' : 'text'}
            className='w-30'
          />
        )
      }
    } else {
      if (field === 'valor_total_da_area' || field === 'valor_por_alqueire' || field === 'valor_por_hectare' || field === 'valor_medio_por_hora_de_voo' || field === 'lucro_por_area') {
        return `R$ ${Number(service[field]).toLocaleString()}`
      } else if (field === 'percentual_de_lucro_liquido_por_area') {
        return `${Number(service[field]).toLocaleString()}%`
      } else {
        return service[field]
      }
    }
  }

  const renderMobileView = () => (
    <div className="space-y-4">
      {currentItems.map((service) => (
        <Card key={service.id} className="bg-[#556B2F] text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Serviço ID: {service.id}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleRowExpansion(service.id)}
            >
              {expandedRows.includes(service.id) ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-xs">
              <p>Data de Início: {service.data_inicio}</p>
              <p>Solicitante: {service.solicitante_da_area}</p>
              <p>Área: {service.nome_da_area}</p>
              <p>Valor Total: R$ {Number(service.valor_total_da_area).toLocaleString()}</p>
              <p className={`${service.confirmacao_de_pagamento_da_area.toLowerCase().includes("Em Aberto".toLowerCase()) && 'bg-yellow-400'}`}>{service.confirmacao_de_pagamento_da_area}</p>
            </div>
            {expandedRows.includes(service.id) && (
              <div className="mt-2 text-xs">
                <p>Data Final: {service.data_final}</p>
                <p>Tamanho (Hectares): {service.tamanho_area_hectares}</p>
                <p>Tamanho (Alqueires): {service.tamanho_area_alqueires}</p>
                <p>Tipo de Aplicação: {service.tipo_aplicacao_na_area}</p>
                <p>Quantidade no Hopper: {service.quantidade_no_hopper_por_voo}</p>
                <p>Tipo de Vazão: {service.tipo_de_vazao}</p>
                <p>Quantidade de Voos: {service.quantidade_de_voos_na_area}</p>
                <p>Valor por Alqueire: R$ {Number(service.valor_por_alqueire).toLocaleString()}</p>
                <p>Valor por Hectare: R$ {Number(service.valor_por_hectare).toLocaleString()}</p>
                <p>Valor Médio por Hora: R$ {Number(service.valor_medio_por_hora_de_voo).toLocaleString()}</p>
                <p>Tempo de Voo: {service.tempo_de_voo_gasto_na_area}</p>
                <p>Aeronave: {service.aeronave_data}</p>
                <p>Piloto: {service.employee_data}</p>
                <p>Lucro: R$ {Number(service.lucro_por_area).toLocaleString()}</p>
                <p>Percentual de Lucro: {service.percentual_de_lucro_liquido_por_area.toLocaleString()}%</p>
                <p>Criado em: {service.criado_em}</p>
                <p>Criado por: {service.criado_por}</p>
              </div>
            )}
            <div className="mt-2 flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleEditService(service)}>
                <Edit className="h-4 w-4 text-black" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDeleteService(service.id)}>
                <Trash2 className="h-4 w-4  text-black" />
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className='text-black'>Ver Despesas</Button>
                </DialogTrigger>
                <DialogContent className="bg-[#4B5320] text-white">
                  <DialogHeader>
                    <DialogTitle>Despesas do Serviço  {service.id}</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[300px]">
                    {expenses.map((expense) => (
                      parseInt(expense.service_id) === service.id && <div key={expense.id} className="mb-2 p-2 bg-[#556B2F] rounded">
                        <p>Data: {expense.data}</p>
                        <p>Origem: {expense.origem}</p>
                        <p>Valor: R$ {expense.valor}</p>
                        <p>Pagamento: {expense.pagamento}</p>
                      </div>
                    ))}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const handleFilterChange = (field: keyof Service, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-6 bg-[#556B2F] rounded-lg text-white">
      <div className="flex flex-col space-y-4 mb-6">
        <h2 className="text-2xl font-bold">Serviços:</h2>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {selectedServices.length > 0 && (
          <Button variant="destructive" onClick={handleDeleteSelected}>
            Deletar Selecionados ({selectedServices.length})
          </Button>
        )}
      </div>

      <div className="max-md:hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedServices.length === services.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className='text-white'>Ações</TableHead>
              <TableHead className='text-white'>
                ID
                <Input
                  placeholder="Filtrar ID"
                  value={filters.id || ''}
                  onChange={(e) => handleFilterChange('id', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>
              <TableHead className='text-white'>
                Aeronave
                <Input
                  placeholder="Filtrar Aeronave"
                  value={filters.aeronave_data || ''}
                  onChange={(e) => handleFilterChange('aeronave_data', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>
              <TableHead className='text-white'>
                Piloto
                <Input
                  placeholder="Filtrar Piloto"
                  value={filters.employee_data || ''}
                  onChange={(e) => handleFilterChange('employee_data', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>
              <TableHead className='text-white'>
                Confirmação de Pagamento
                <Input
                  placeholder="Filtrar Pagamento"
                  value={filters.confirmacao_de_pagamento_da_area || ''}
                  onChange={(e) => handleFilterChange('confirmacao_de_pagamento_da_area', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>
              <TableHead className='text-white'>
                Solicitante
                <Input
                  placeholder="Filtrar Solicitante"
                  value={filters.solicitante_da_area || ''}
                  onChange={(e) => handleFilterChange('solicitante_da_area', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>
              <TableHead className='text-white'>
                Nome da Área
                <Input
                  placeholder="Filtrar Nome da Área"
                  value={filters.nome_da_area || ''}
                  onChange={(e) => handleFilterChange('nome_da_area', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>
              <TableHead className='text-white'>
                Tamanho (Hectares)
                <Input
                  placeholder="Filtrar Hectares"
                  value={filters.tamanho_area_hectares || ''}
                  onChange={(e) => handleFilterChange('tamanho_area_hectares', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>
              <TableHead className='text-white'>
                Tamanho (Alqueires)
                <Input
                  placeholder="Filtrar Alqueires"
                  value={filters.tamanho_area_alqueires || ''}
                  onChange={(e) => handleFilterChange('tamanho_area_alqueires', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>
              <TableHead className='text-white'>
                Tipo de Aplicação
                <Select onValueChange={(e) => handleFilterChange('tipo_aplicacao_na_area', e)} value={filters.tipo_aplicacao_na_area || ''}>
                  <SelectTrigger id="tipo_aplicacao_na_area">
                    <SelectValue placeholder="Selecione o tipo de aplicação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semente">Semente</SelectItem>
                    <SelectItem value="liquido">Liquido</SelectItem>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead className='text-white'>
                Valor Total
                <Input
                  placeholder="Filtrar Valor"
                  value={filters.valor_total_da_area || ''}
                  onChange={(e) => handleFilterChange('valor_total_da_area', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>
              <TableHead className='text-white'>
                Quantidade no Hopper
                <Input
                  placeholder="Filtrar Quantidade no Hopper"
                  value={filters.quantidade_no_hopper_por_voo || ''}
                  onChange={(e) => handleFilterChange('quantidade_no_hopper_por_voo', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>
              <TableHead className='text-white'>
                Tipo de Vazão
                <Input
                  placeholder="Filtrar Tipo de Vazão"
                  value={filters.tipo_de_vazao || ''}
                  onChange={(e) => handleFilterChange('tipo_de_vazao', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>
              <TableHead className='text-white'>
                Quantidade de Voos
                <Input
                  placeholder="Filtrar Quantidade de Voos"
                  value={filters.quantidade_de_voos_na_area || ''}
                  onChange={(e) => handleFilterChange('quantidade_de_voos_na_area', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>
              <TableHead className='text-white'>
                Valor por Hectare
                <Input
                  placeholder="Filtrar Valor por Hectare"
                  value={filters.valor_por_hectare || ''}
                  onChange={(e) => handleFilterChange('valor_por_hectare', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>
              <TableHead className='text-white'>
                Valor por Alqueire
                <Input
                  placeholder="Filtrar Valor por Alqueire"
                  value={filters.valor_por_alqueire || ''}
                  onChange={(e) => handleFilterChange('valor_por_alqueire', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>

              <TableHead className='text-white'>
                Valor Médio por Hora de Voo
                <Input
                  placeholder="Filtrar Valor Médio por Hora"
                  value={filters.valor_medio_por_hora_de_voo || ''}
                  onChange={(e) => handleFilterChange('valor_medio_por_hora_de_voo', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>

              <TableHead className='text-white'>
                Tempo de Voo
                <Input
                  placeholder="Filtrar Tempo de Voo"
                  value={filters.tempo_de_voo_gasto_na_area || ''}
                  onChange={(e) => handleFilterChange('tempo_de_voo_gasto_na_area', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>

              <TableHead className='text-white'>
                Data de Início
                <Input
                  placeholder="Filtrar Data Início"
                  value={filters.data_inicio || ''}
                  onChange={(e) => handleFilterChange('data_inicio', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>
              <TableHead className='text-white'>
                Data Final
                <Input
                  placeholder="Filtrar Data Final"
                  value={filters.data_final || ''}
                  onChange={(e) => handleFilterChange('data_final', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>

              <TableHead className='text-white'>
                Lucro por Área
                <Input
                  placeholder="Filtrar Lucro por Área"
                  value={filters.lucro_por_area || ''}
                  onChange={(e) => handleFilterChange('lucro_por_area', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>
              <TableHead className='text-white'>
                Percentual de Lucro Líquido
                <Input
                  placeholder="Filtrar Percentual de Lucro"
                  value={filters.percentual_de_lucro_liquido_por_area || ''}
                  onChange={(e) => handleFilterChange('percentual_de_lucro_liquido_por_area', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>
              <TableHead className='text-white'>
                Criado Por
                <Input
                  placeholder="Filtrar Criado Por"
                  value={filters.criado_por || ''}
                  onChange={(e) => handleFilterChange('criado_por', e.target.value)}
                  className="mt-1 w-30"
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems?.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedServices.includes(service.id)}
                    onCheckedChange={() => handleSelectService(service.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2 text-black max-md:hidden">
                    {editingId === service.id ? (
                      <>
                        <Button variant="outline" size="sm" onClick={handleSaveEdit}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleEditService(service)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDeleteService(service.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Ver Despesas</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Despesas do Serviço {service.id}</DialogTitle>
                        </DialogHeader>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead>Origem</TableHead>
                              <TableHead>Porcentagem</TableHead>
                              <TableHead>Valor</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {expenses.map((expense) => (
                              parseInt(expense.service_id) === service.id && <TableRow key={expense.id}>
                                <TableCell>{expense.id}</TableCell>
                                <TableCell>{format(new Date(expense.data), 'dd/MM/yyyy')}</TableCell>
                                <TableCell>{expense.origem}</TableCell>
                                <TableCell>{expense.porcentagem}%</TableCell>
                                <TableCell>R$ {expense.valor}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
                <TableCell>{service.id}</TableCell>
                <TableCell>{service.aeronave_data}</TableCell>
                <TableCell>{service.employee_data}</TableCell>
                {renderEditableCell(service, 'confirmacao_de_pagamento_da_area')
                  ?.toString()
                  .toLowerCase()
                  .includes("aberto") ?
                  <TableCell className='bg-yellow-600'> {renderEditableCell(service, 'confirmacao_de_pagamento_da_area')}</TableCell> :
                  <TableCell> {renderEditableCell(service, 'confirmacao_de_pagamento_da_area')}</TableCell>}
                <TableCell>{renderEditableCell(service, 'solicitante_da_area')}</TableCell>
                <TableCell>{renderEditableCell(service, 'nome_da_area')}</TableCell>
                <TableCell>{renderEditableCell(service, 'tamanho_area_hectares')}</TableCell>
                <TableCell>{renderEditableCell(service, 'tamanho_area_alqueires')}</TableCell>
                <TableCell>{renderEditableCell(service, 'tipo_aplicacao_na_area')}</TableCell>
                <TableCell>{renderEditableCell(service, 'valor_total_da_area')}</TableCell>
                <TableCell>{renderEditableCell(service, 'quantidade_no_hopper_por_voo')}</TableCell>
                <TableCell>{renderEditableCell(service, 'tipo_de_vazao')}</TableCell>
                <TableCell>{renderEditableCell(service, 'quantidade_de_voos_na_area')}</TableCell>
                <TableCell>{renderEditableCell(service, 'valor_por_hectare')}</TableCell>
                <TableCell>{renderEditableCell(service, 'valor_medio_por_hora_de_voo')}</TableCell>
                <TableCell>{renderEditableCell(service, 'tempo_de_voo_gasto_na_area')}</TableCell>
                <TableCell>{renderEditableCell(service, 'valor_por_alqueire')}</TableCell>
                <TableCell>
                  {(() => {
                    const dateValue = renderEditableCell(service, 'data_inicio');
                    const parsedDate = new Date(dateValue);

                    // Verifica se a data é válida
                    if (!isNaN(parsedDate)) {
                      return format(parsedDate, 'dd/MM/yyyy');
                    } else {
                      return '-';
                    }
                  })()}
                </TableCell>
                <TableCell>
                  {(() => {
                    const dateValue = renderEditableCell(service, 'data_final');
                    const parsedDate = new Date(dateValue);

                    // Verifica se a data é válida
                    if (!isNaN(parsedDate)) {
                      return format(parsedDate, 'dd/MM/yyyy');
                    } else {
                      return '-';
                    }
                  })()}
                </TableCell>
                <TableCell>{renderEditableCell(service, 'lucro_por_area')}</TableCell>
                <TableCell>{renderEditableCell(service, 'percentual_de_lucro_liquido_por_area')}</TableCell>
                <TableCell>{service.criado_por}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden">
        {renderMobileView()}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <div>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Itens por página" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            className='text-black'
            variant="outline"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            className='text-black'
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="flex items-center px-2">
            Página {currentPage} de {Math.ceil(filteredServices.length / itemsPerPage)}
          </span>
          <Button
            className='text-black'
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredServices.length / itemsPerPage)))}
            disabled={currentPage === Math.ceil(filteredServices.length / itemsPerPage)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            className='text-black'
            variant="outline"
            onClick={() => setCurrentPage(Math.ceil(filteredServices.length / itemsPerPage))}
            disabled={currentPage === Math.ceil(filteredServices.length / itemsPerPage)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}