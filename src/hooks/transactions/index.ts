import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { ITransaction } from '@/types/transaction'

const QUERY_KEY = 'transactions'

export function useTransaction() {
  const queryClient = useQueryClient()

  function ListAll() {
    return useQuery({
      queryKey: [QUERY_KEY],
      queryFn: async () => {
        const { data } = await api.get('/transactions')
        return data
      },
    })
  }

  function Create() {
    return useMutation({
      mutationFn: async (newTransaction: ITransaction) => {
        const { data } = await api.post('/transactions', newTransaction)
        return data
      },
      onSuccess: () => {
        queryClient.invalidateQueries([QUERY_KEY])
      },
    })
  }

  function Update() {
    return useMutation({
      mutationFn: async (updated: ITransaction) => {
        const { id, ...rest } = updated
        const { data } = await api.put(`/transactions/${id}`, rest)
        return data
      },
      onSuccess: () => {
        queryClient.invalidateQueries([QUERY_KEY])
      },
    })
  }

  function Delete() {
    return useMutation({
      mutationFn: async (id: string) => {
        await api.delete(`/transactions/${id}`)
      },
      onSuccess: () => {
        queryClient.invalidateQueries([QUERY_KEY])
      },
    })
  }

  return {
    ListAll,
    Create,
    Update,
    Delete,
  }
}
