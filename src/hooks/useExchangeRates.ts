import { useQuery } from '@tanstack/react-query'

interface ExchangeRate {
  USD: number
  EUR: number
}

export function useExchangeRates() {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async (): Promise<ExchangeRate> => {
      const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL')
      const data = await response.json()

      return {
        USD: Number(data.USDBRL.bid), 
        EUR: Number(data.EURBRL.bid)
      }
    },
    staleTime: 1000 * 60 * 60, 
    refetchOnWindowFocus: false, 
  })
}