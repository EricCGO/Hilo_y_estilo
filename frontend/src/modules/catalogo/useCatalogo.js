import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import api from '@/shared/api/apiClient';
import { endpoints } from '@/shared/api/endpoints';
import { useAsync } from '@/shared/hooks/useAsync';
import { useDebounce } from '@/shared/hooks/useDebounce';

export function useCatalogo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoria = searchParams.get('categoria') || '';
  const q = searchParams.get('q') || '';
  const page = Number(searchParams.get('page') || 1);
  const [busqueda, setBusqueda] = useState(q);
  const debounced = useDebounce(busqueda, 350);

  const actualizar = useCallback(
    (cambios) => {
      const siguiente = new URLSearchParams(searchParams);
      Object.entries(cambios).forEach(([clave, valor]) => {
        if (valor) siguiente.set(clave, String(valor));
        else siguiente.delete(clave);
      });
      setSearchParams(siguiente);
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    if (debounced !== q) actualizar({ q: debounced, page: 1 });
  }, [debounced, q, actualizar]);

  const cargar = useCallback(
    () =>
      Promise.all([
        api.get(endpoints.productos, {
          params: { categoria, q, page, limit: 9 },
        }),
        api.get(endpoints.categorias),
      ]).then(([productos, categorias]) => ({
        productos,
        categorias: categorias.data,
      })),
    [categoria, q, page]
  );

  const { data, loading, error, reload } = useAsync(cargar, [cargar]);

  return {
    data,
    loading,
    error,
    reload,
    categoria,
    q,
    page,
    busqueda,
    setBusqueda,
    setCategoria: (valor) => actualizar({ categoria: valor, page: 1 }),
    setPage: (valor) => actualizar({ page: valor }),
  };
}
