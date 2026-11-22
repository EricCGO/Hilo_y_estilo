import { useCallback } from 'react';
import api from '@/shared/api/apiClient';
import { endpoints } from '@/shared/api/endpoints';
import { useAsync } from '@/shared/hooks/useAsync';

export function usePedidos() {
  const cargar = useCallback(() => api.get(endpoints.pedidos), []);
  const { data, loading, error, reload } = useAsync(cargar, [cargar]);
  return { pedidos: data?.data || [], meta: data?.meta, loading, error, reload };
}

export function usePedido(id) {
  const cargar = useCallback(() => api.get(endpoints.pedido(id)), [id]);
  const { data, loading, error, reload } = useAsync(cargar, [cargar]);
  return { pedido: data?.data, loading, error, reload };
}
