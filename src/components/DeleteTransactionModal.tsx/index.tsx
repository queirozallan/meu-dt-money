'use client'

import { Dialog } from '@headlessui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

interface DeleteTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string | null
}

export function DeleteTransactionModal({
  isOpen,
  onClose,
  transactionId
}: DeleteTransactionModalProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      if (!transactionId) return
      await axios.delete(`/transactions/${transactionId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions'])
      onClose()
    }
  })

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6 shadow">
          <Dialog.Title className="text-lg font-bold">Excluir Transação</Dialog.Title>
          <p className="mt-2 text-sm text-gray-600">
            Tem certeza que deseja excluir esta transação?
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={() => mutation.mutate()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Excluir
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
