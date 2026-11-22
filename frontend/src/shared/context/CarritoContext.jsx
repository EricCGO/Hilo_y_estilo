import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CarritoContext = createContext(null);
const CLAVE = 'hilo-y-estilo-carrito';

function leerLocal() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) || [];
  } catch {
    return [];
  }
}

export function CarritoProvider({ children }) {
  const [items, setItems] = useState(leerLocal);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CLAVE, JSON.stringify(items));
  }, [items]);

  const agregar = (producto) => {
    setItems((actuales) => {
      const existe = actuales.find((item) => item.productoId === producto.id);
      if (existe) {
        return actuales.map((item) =>
          item.productoId === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [
        ...actuales,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          precio: Number(producto.precio),
          cantidad: 1,
        },
      ];
    });
    setIsOpen(true);
  };

  const cambiarCantidad = (productoId, cantidad) =>
    setItems((actuales) =>
      cantidad <= 0
        ? actuales.filter((item) => item.productoId !== productoId)
        : actuales.map((item) =>
            item.productoId === productoId ? { ...item, cantidad } : item
          )
    );

  const quitar = (productoId) =>
    setItems((actuales) => actuales.filter((item) => item.productoId !== productoId));

  const vaciar = () => setItems([]);

  const valor = useMemo(
    () => ({
      items,
      count: items.reduce((suma, item) => suma + item.cantidad, 0),
      total: items.reduce((suma, item) => suma + item.precio * item.cantidad, 0),
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [items, isOpen]
  );

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
  const contexto = useContext(CarritoContext);
  if (!contexto) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>');
  return contexto;
}
