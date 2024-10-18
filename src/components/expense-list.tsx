'use client'

import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Save, Trash2, X, ChevronDown, ChevronUp, Filter, ChevronLeft, ChevronsLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import axios from 'axios'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
type Expense = {
  id: number
  data: string
  origem: string
  tipo?: string
  descricao?: string
  valor: number
  confirmação_de_pagamento: string
  aircraft_name?: string
  porcentagem?: number
  employee_name?: string
  service_name?: string
  harvest: string
}

const expenseTypes = [
  { key: 'aircraft', label: 'Aeronaves' },
  { key: 'commission', label: 'Comissões' },
  { key: 'vehicle', label: 'Veículos' },
  { key: 'specific', label: 'Específicas' },
]

type Safra = {
  id: string;
  startDate: string;
  endDate: string;
  label: string;
}

export function ExpenseList({ selectedSafra }: { selectedSafra: Safra }) {
  const [activeTab, setActiveTab] = useState('aircraft')
  const [expenses, setExpenses] = useState<Record<string, Expense[]>>({
    aircraft: [],
    commission: [],
    vehicle: [],
    specific: [],
  })

  const [selectedExpenses, setSelectedExpenses] = useState<number[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [expandedRows, setExpandedRows] = useState<number[]>([])

  // New state variables for pagination, filtering, and search
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const fetchData = async () => {
    try {
      const expensesAircraft = await axios.get('/api/expenses_aircraft');
      const expensesCommission = await axios.get('/api/comissions');
      const expensesVehicle = await axios.get('/api/expenses_vehicles');
      const expensesSpecific = await axios.get('/api/expenses_specific');

      console.log(expensesCommission.data);

      setExpenses({
        specific: expensesSpecific.data,
        vehicle: expensesVehicle.data,
        commission: expensesCommission.data,
        aircraft: expensesAircraft.data,
      });
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSafra]);

  const filteredExpenses = expenses[activeTab]?.filter(expense => {
    if (!expense) {
      return null
    }
    const expenseDate = new Date(expense.data)
    const safraStartDate = selectedSafra ? new Date(selectedSafra.startDate) : null
    const safraEndDate = selectedSafra ? new Date(selectedSafra.endDate) : null

    const isWithinSafraDates = !selectedSafra ||
      (expenseDate >= safraStartDate && expenseDate <= safraEndDate)

    const matchesSearch = searchTerm === '' ||
      expense?.aircraft_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense?.id.toString() === searchTerm ||
      expense?.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.origem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense?.confirmação_de_pagamento && expense?.confirmação_de_pagamento.toLowerCase().includes(searchTerm.toLowerCase())
    return isWithinSafraDates && matchesSearch
  })

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredExpenses?.slice(indexOfFirstItem, indexOfLastItem)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedExpenses(currentItems.map(expense => expense.id))
    } else {
      setSelectedExpenses([])
    }
  }

  const handleSelectExpense = (expenseId: number) => {
    setSelectedExpenses(prev =>
      prev.includes(expenseId)
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    )
  }

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setEditingExpense({ ...expense })
  }

  const handleSaveEdit = async () => {
    if (editingExpense) {
      try {
        // Faz a chamada à API para atualizar a despesa no banco de dados
        const response = await axios.put('/api/expenses', {
          id: editingExpense.id,
          updatedData: { ...editingExpense, data: new Date(editingExpense.data) },
        });

        if (response.status === 200) {
          // Atualiza o estado local se o update for bem-sucedido
          setExpenses(prevExpenses => ({
            ...prevExpenses,  // Preserva as outras abas
            [activeTab]: prevExpenses[activeTab].map(expense =>
              expense.id === editingExpense.id ? editingExpense : expense
            ),  // Atualiza a despesa dentro da aba ativa
          }));

          // Limpa o estado de edição após salvar
          setEditingId(null);
          setEditingExpense(null);
        }
      } catch (error) {
        console.error('Erro ao atualizar despesa:', error);
        toast({ title: 'Erro ao salvar a edição. Tente novamente.', variant: 'destructive' });
      }
    }
  };


  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingExpense(null)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete('/api/expenses/', {
        data: {
          ids: [id]
        }
      })
      setExpenses(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(expense => expense.id !== id)
      }))
      toast({
        title: "Despesas deletadas com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro ao deletar os Despesas",
        description: "Ocorreu um erro ao tentar deletar os Despesas. Por favor, tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSelected = async () => {
    try {
      const response = await axios.delete('/api/expenses/', {
        data: {
          ids: selectedExpenses
        }
      })

      setExpenses(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(expense => !selectedExpenses.includes(expense.id))
      }))
      setSelectedExpenses([])
      toast({
        title: "Despesas deletadas com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro ao deletar os Despesas",
        description: "Ocorreu um erro ao tentar deletar os Despesas. Por favor, tente novamente.",
        variant: "destructive",
      })
    }
  };


  const handleBulkUpdate = async (field: string, value: string) => {
    try {
      const response = await axios.put('/api/expenses/bulk-update', {
        ids: selectedExpenses, 
        field: 'confirma__o_de_pagamento',             
        value                  
      });

      if (response.status === 200) {
        setExpenses(prev => ({
          ...prev,
          [activeTab]: prev[activeTab].map(expense =>
            selectedExpenses.includes(expense.id) ? { ...expense, [field]: value } : expense
          )
        }));
      }
      toast({
        title: "Despesas Atualizadas",
      })
    } catch (error) {
      console.error('Erro ao atualizar despesas em lote:', error);
      toast({
        title: "Erro ao atualizar despesas. Tente novamente.",
        variant: "destructive",
      })
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditingExpense(prev => {
      if (prev) {
        return { ...prev, [name]: name === 'valor' || name === 'porcentagem' ? parseFloat(value) : value }
      }
      return null
    })
  }

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  const renderMobileTable = (expenses: Expense[]) => (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <Card key={expense.id} className="bg-[#556B2F] text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              ID: {expense.id} - {expense.data}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleRowExpansion(expense.id)}
            >
              {expandedRows.includes(expense.id) ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-xs">
              <p>Aeronave: {expense.aircraft_name}</p>
              <p>Piloto: {expense.employee_name}</p>
              <p>Valor: R$ {Number(expense.valor).toLocaleString()}</p>
              <p>Pagamento: {expense.confirmação_de_pagamento}</p>
            </div>
            {expandedRows.includes(expense.id) && (
              <div className="mt-2 text-xs">
                {expense.tipo && <p>Tipo: {expense.tipo}</p>}
                {expense.descricao && <p>Descrição: {expense.descricao}</p>}
                {expense.porcentagem && <p>Porcentagem: {expense.porcentagem}%</p>}
                {expense.service_name && <p>Serviço: {expense.service_name}</p>}
                {expense.origem && <p>Origem: {expense.origem}</p>}
                {expense.harvest && <p>Safra: {expense.harvest}</p>}
              </div>
            )}
            <div className="mt-2 flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(expense)}>
                <Edit className="h-4 w-4 text-black" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(expense.id)}>
                <Trash2 className="h-4 w-4 text-black" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const totalPages = Math.ceil(filteredExpenses?.length / itemsPerPage)
  const maxVisibleButtons = 5

  const renderPaginationButtons = () => {
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2))
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1)

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1)
    }

    const buttons = []

    if (startPage > 1) {
      buttons.push(
        <Button key="first" onClick={() => paginate(1)} variant="outline" className="text-white">
          <ChevronsLeft className="h-4 w-4 text-black" />
        </Button>
      )
    }

    if (currentPage > 1) {
      buttons.push(
        <Button key="prev" onClick={() => paginate(currentPage - 1)} variant="outline" className="text-white">
          <ChevronLeft className="h-4 w-4 text-black" />
        </Button>
      )
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          onClick={() => paginate(i)}
          variant={currentPage === i ? "default" : "outline"}
          className={`${currentPage === i ? "bg-[#8FBC8F] text-white" : "text-black"}`}
        >
          {i}
        </Button>
      )
    }

    if (currentPage < totalPages) {
      buttons.push(
        <Button key="next" onClick={() => paginate(currentPage + 1)} variant="outline" className="text-white">
          <ChevronRight className="h-4 w-4 text-black" />
        </Button>
      )
    }

    if (endPage < totalPages) {
      buttons.push(
        <Button key="last" onClick={() => paginate(totalPages)} variant="outline" className="text-white">
          <ChevronsRight className="h-4 w-4 text-black" />
        </Button>
      )
    }

    return buttons
  }

  const renderDesktopTable = (expenses: Expense[]) => (
    expenses && <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px] text-white">
            <Checkbox
              checked={selectedExpenses.length === expenses?.length}
              onCheckedChange={handleSelectAll}
            />
          </TableHead>
          <TableHead className="w-[100px] text-white">Ações</TableHead>
          <TableHead className='text-white'>ID</TableHead>
          {activeTab !== 'commission' && <TableHead className='text-white'>Aeronave</TableHead>}
          {activeTab === 'commission' && (
            <>
              <TableHead className='text-white'>Nome</TableHead>
              <TableHead className='text-white'>Serviço</TableHead>
              <TableHead className='text-white'>Porcentagem</TableHead>
            </>
          )}
          <TableHead className='text-white'>Data</TableHead>
          <TableHead className='text-white'>Origem</TableHead>
          {activeTab !== 'commission' && activeTab !== 'specific' && <TableHead className='text-white'>Tipo</TableHead>}
          <TableHead className='text-white'>Descrição</TableHead>
          <TableHead className='text-white'>Valor</TableHead>
          <TableHead className='text-white'>Pagamento</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses?.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell>
              <Checkbox
                checked={selectedExpenses.includes(expense.id)}
                onCheckedChange={() => handleSelectExpense(expense.id)}
              />
            </TableCell>
            <TableCell>
              <div className="flex space-x-2 max-md:hidden">
                {editingId === expense.id ? (
                  <>
                    <Button variant="outline" size="icon" onClick={handleSaveEdit}>
                      <Save className="h-4 w-4 text-[#4B5320]" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 text-[#4B5320]" />
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="icon" onClick={() => handleEdit(expense)}>
                    <Edit className="h-4 w-4 text-[#4B5320]" />
                  </Button>
                )}
                <Button variant="outline" size="icon" onClick={() => handleDelete(expense.id)}>
                  <Trash2 className="h-4 w-4 text-[#4B5320]" />
                </Button>
              </div>
            </TableCell>
            <TableCell>{expense.id}</TableCell>
            {activeTab !== 'commission' && (
              <TableCell>
                {expense.aircraft_name}
              </TableCell>
            )}
            {activeTab === 'commission' && (
              <>
                <TableCell>
                  {expense.employee_name}
                </TableCell>
                <TableCell>
                  {expense.service_name}
                </TableCell>
                <TableCell>
                  {editingId === expense.id ? (
                    <Input
                      name="porcentagem"
                      type="number"
                      value={editingExpense?.porcentagem || ''}
                      onChange={handleEditInputChange}
                      className="bg-[#556B2F] text-white border-[#8FBC8F]"
                    />
                  ) : (
                    `${expense.porcentagem}%`
                  )}
                </TableCell>
              </>
            )}
            <TableCell>
              {editingId === expense.id ? (
                <Input
                  name="data"
                  value={editingExpense?.data || ''}
                  onChange={handleEditInputChange}
                  className="bg-[#556B2F] text-white border-[#8FBC8F]"
                />
              ) : (
                format(expense.data, "dd-MM-yyyy")
              )}
            </TableCell>
            <TableCell>{expense.origem}</TableCell>
            {activeTab !== 'commission' && activeTab !== 'specific' && (
              <TableCell>
                {editingId === expense.id ? (
                  <Input
                    name="tipo"
                    value={editingExpense?.tipo || ''}
                    onChange={handleEditInputChange}
                    className="bg-[#556B2F] text-white border-[#8FBC8F]"
                  />
                ) : (
                  expense.tipo
                )}

              </TableCell>
            )}
            <TableCell>
              {editingId === expense.id ? (
                <Input
                  name="descricao"
                  value={editingExpense?.descricao || ''}
                  onChange={handleEditInputChange}
                  className="bg-[#556B2F] text-white border-[#8FBC8F]"
                />
              ) : (
                expense.descricao
              )}
            </TableCell>
            <TableCell>
              {editingId === expense.id ? (
                <Input
                  name="valor"
                  type="number"
                  value={editingExpense?.valor || ''}
                  onChange={handleEditInputChange}
                  className="bg-[#556B2F] text-white border-[#8FBC8F]"
                />
              ) : (
                `R$ ${expense.valor}`
              )}
            </TableCell>
            <TableCell>
              {editingId === expense.id ? (
                <Select
                  name="confirmação_de_pagamento"
                  value={editingExpense?.confirmação_de_pagamento || ''}
                  onValueChange={(value) => setEditingExpense(prev => prev ? { ...prev, confirmação_de_pagamento: value } : null)}
                >
                  <SelectTrigger className="bg-[#556B2F] text-white border-[#8FBC8F]">
                    <SelectValue placeholder="Status de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                expense.confirmação_de_pagamento
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="p-4 sm:p-6 bg-[#4B5320] text-white rounded-lg shadow">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Lista de Despesas</h2>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 max-md:h-28 h-16">
          {expenseTypes.map((type) => (
            <TabsTrigger key={type.key} value={type.key} className="text-white bg-[#556B2F] my-2 mx-2">
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {expenseTypes.map((type) => (
          <TabsContent key={type.key} value={type.key}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
              <div className="w-full sm:w-auto flex items-center space-x-2">
                <Input
                  placeholder="Pesquisar despesas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 bg-[#556B2F] text-white border-[#8FBC8F]"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="sm:hidden"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen} className="sm:hidden mb-4">
              <CollapsibleContent>
                <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
                  <SelectTrigger className="w-full bg-[#556B2F] text-white border-[#8FBC8F]">
                    <SelectValue placeholder="Status de pagamento" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#556B2F] text-white">
                    <SelectItem value="''">Todos</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </CollapsibleContent>
            </Collapsible>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              {selectedExpenses.length > 0 && (
                <>
                  <Select onValueChange={(value) => handleBulkUpdate('confirmação_de_pagamento', value)}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-[#556B2F] text-white border-[#8FBC8F]">
                      <SelectValue placeholder="Atualizar pagamento" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#556B2F] text-white">
                      <SelectItem value="Pago">Pago</SelectItem>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="destructive" onClick={handleDeleteSelected} className="bg-[#FF6B6B] text-white hover:bg-[#FF4040]">
                    Deletar Selecionados ({selectedExpenses.length})
                  </Button>
                </>
              )}
            </div>
            <div className="hidden sm:block">
              {currentItems && renderDesktopTable(currentItems)}
            </div>
            <div className="sm:hidden">
              {currentItems && renderMobileTable(currentItems)}
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
                {renderPaginationButtons()}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}