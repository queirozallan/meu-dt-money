import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ModalConfirm } from "./ModalConfirm";
import { formatCurrency, formatDate } from "@/utils";
import { ITransaction } from "@/types/transaction";

export function TransactionsPage() {
  // >>> Estados para modal e paginação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const queryClient = useQueryClient();

  // >>> Query para buscar transações com paginação
  const { data: transactions, isLoading } = useQuery(
    ["transactions", page],
    () =>
      fetch(`/api/transactions?skip=${page * pageSize}&take=${pageSize}`).then((res) =>
        res.json()
      ),
    { keepPreviousData: true }
  );

  // >>> Mutation para excluir transação
  const deleteTransactionMutation = useMutation(
    async (id: string) => {
      const response = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao excluir");
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["transactions"]);
        setIsModalOpen(false);
        setTransactionToDelete(null);
      },
    }
  );

  // >>> Mutation para atualizar transação
  const updateTransactionMutation = useMutation(
    async (data: ITransaction) => {
      const response = await fetch(`/api/transactions/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao atualizar");
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["transactions"]);
        setEditingTransaction(null);
      },
    }
  );

  // >>> Handlers para modais e ações
  function handleOpenModal(id: string) {
    setTransactionToDelete(id);
    setIsModalOpen(true);
  }

  function handleCancelDelete() {
    setTransactionToDelete(null);
    setIsModalOpen(false);
  }

  function handleConfirmDelete() {
    if (transactionToDelete) {
      deleteTransactionMutation.mutate(transactionToDelete);
    }
  }

  function handleOpenEdit(transaction: ITransaction) {
    setEditingTransaction(transaction);
  }

  function handleCloseEdit() {
    setEditingTransaction(null);
  }

  function handleUpdateTransaction(updatedData: ITransaction) {
    updateTransactionMutation.mutate(updatedData);
  }

  return (
    <div>
      {isLoading && <p>Carregando...</p>}

      {/* Usa componente Table e passa dados + funções */}
      <Table
        data={transactions || []}
        onDelete={handleOpenModal}
        onEdit={handleOpenEdit}
      />

      {/* Paginação */}
      <div className="mt-4 flex justify-between">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-gray-300 rounded"
        >
          Anterior
        </button>
        <button
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-gray-300 rounded"
        >
          Próximo
        </button>
      </div>

      {/* Modal Exclusão */}
      <ModalConfirm
        isOpen={isModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message="Tem certeza que deseja excluir esta transação?"
      />

      {/* Modal edição */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded max-w-md w-full">
            <h2 className="mb-4 text-lg font-bold">Editar Transação</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedTransaction = {
                  ...editingTransaction,
                  description: formData.get("description") as string,
                  amount: Number(formData.get("amount")),
                };
                handleUpdateTransaction(updatedTransaction);
              }}
            >
              <input
                name="description"
                defaultValue={editingTransaction.description}
                className="border p-2 mb-4 w-full"
                required
              />
              <input
                name="amount"
                type="number"
                defaultValue={editingTransaction.amount}
                className="border p-2 mb-4 w-full"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente Table separado (apenas recebe props)
interface ITableProps {
  data: ITransaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: ITransaction) => void;
}

export function Table({ data, onDelete, onEdit }: ITableProps) {
  return (
    <table className="w-full mt-16 border-0 border-separate border-spacing-y-2 ">
      <thead>
        <tr>
          <th className="px-4 text-left text-table-header text-base font-medium">
            Título
          </th>
          <th className="px-4 text-left text-table-header text-base font-medium">
            Preço
          </th>
          <th className="px-4 text-left text-table-header text-base font-medium">
            Categoria
          </th>
          <th className="px-4 text-left text-table-header text-base font-medium">
            Data
          </th>
          <th className="px-4 text-left text-table-header text-base font-medium">
            Ações
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((transaction, index) => (
          <tr key={transaction.id} className="bg-white h-16 rounded-lg">
            <td className="px-4 py-4 whitespace-nowrap text-title">
              {transaction.title}
            </td>
            <td
              className={`px-4 py-4 whitespace-nowrap text-right ${
                transaction.type === "INCOME" ? "text-income" : "text-outcome"
              }`}
            >
              {formatCurrency(transaction.price)}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-table">
              {transaction.category}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-table">
              {transaction.data ? formatDate(new Date(transaction.data)) : ""}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-table">
              <button
                className="text-blue-500 hover:underline mr-2"
                onClick={() => onEdit(transaction)}
              >
                ✏️ Editar
              </button>
              <button
                className="text-red-500 hover:underline"
                onClick={() => onDelete(transaction.id)}
              >
                🗑️ Excluir
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
