import { useCallback, useEffect, useState } from 'react';

/** Ejecuta una función asíncrona y expone estado de carga/error y recarga. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    run()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => setState({ data: null, loading: false, error }));
  }, [run]);

  useEffect(() => {
    let activo = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    run()
      .then((data) => {
        if (activo) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (activo) setState({ data: null, loading: false, error });
      });
    return () => {
      activo = false;
    };
  }, [run]);

  return { ...state, reload };
}
