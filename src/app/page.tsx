"use client";
import { BodyContainer } from "@/components/BodyContainer";
import { CardContainer } from "@/components/CardContainer";
import { FormModal } from "@/components/FormModal";
import { Header } from "@/components/Header";
import { Table } from "@/components/Table";
import { useTransaction } from "@/hooks/transactions";
import { ITotal, ITransaction } from "@/types/transaction";
import { useMemo, useState } from "react";
import { ToastContainer } from "react-toastify";
import { DeleteTransactionModal } from "@/components/DeleteTransactionModal"; // Supondo que exista

export default function Home() {
  // Estado do modal de adicionar
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado do modal de exclusão
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Buscando transações
  const { data: transactions, isLoading } = useTransaction.ListAll();

  // Funções para abrir e fechar modal adicionar
  const openModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Função para abrir modal exclusão passando id
  function handleDelete(id: string) {
    setSelectedId(id);
    setIsDeleteOpen(true);
  }

  // Fechar modal exclusão
  function handleCloseDeleteModal() {
    setIsDeleteOpen(false);
    setSelectedId(null);
  }

  // Aqui você pode implementar função para confirmar exclusão (chamar mutation)
  // Exemplo: function handleConfirmDelete() { ... }

  // Função para adicionar transação
  const { mutateAsync: addTransaction } = useTransaction.Create();
  const handleAddModal = (newTransaction: ITransaction) => {
    addTransaction(newTransaction);
  };

  // Calcular totais com useMemo
  const totalTransactions: ITotal = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { totalIncome: 0, totalOutcome: 0, total: 0 };
    }

    return transactions.reduce(
      (acc: ITotal, { type, price }: ITransaction) => {
        if (type === "INCOME") {
          acc.totalIncome += price;
          acc.total += price;
        } else if (type === "OUTCOME") {
          acc.totalOutcome += price;
          acc.total -= price;
        }
        return acc;
      },
      { totalIncome: 0, totalOutcome: 0, total: 0 }
    );
  }, [transactions]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <ToastContainer />
      <Header openModal={openModal} />
      <BodyContainer>
        <CardContainer totals={totalTransactions} />

        {/* Passar as funções onDelete e onEdit (implemente handleEdit) */}
        <Table
          data={transactions || []}
          onDelete={handleDelete}
          onEdit={(transaction) => {
            // implementar edição se quiser
            console.log("Editar:", transaction);
          }}
        />

        {isModalOpen && (
          <FormModal
            closeModal={handleCloseModal}
            formTitle="Adicionar Transação"
            addTransaction={handleAddModal}
          />
        )}

        {isDeleteOpen && selectedId && (
          <DeleteTransactionModal
            isOpen={isDeleteOpen}
            onClose={handleCloseDeleteModal}
            transactionId={selectedId}
            // Você pode passar também função para confirmar exclusão aqui
          />
        )}
      </BodyContainer>
    </div>
  );
}
