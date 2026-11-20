import { useCallback, useEffect, useState } from 'react';

import { MENSAJES } from '@/constants/mensajes';
import { obtenerLibros } from '@/lib/api';
import type { Libro } from '@/types';

type ResultadoLibros = {
  libros: Libro[];
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
};

export function useLibros(): ResultadoLibros {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Cada vez que cambia, el efecto vuelve a pedir el catálogo.
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    // Si la pantalla se desmonta (o se reintenta) antes de que llegue la respuesta,
    // la limpieza marca este pedido como viejo y su resultado se descarta.
    let vigente = true;

    async function cargar() {
      try {
        const datos = await obtenerLibros();
        if (vigente) {
          setLibros(datos);
          setError(null);
        }
      } catch {
        if (vigente) {
          setError(MENSAJES.errorCatalogo);
        }
      } finally {
        if (vigente) {
          setCargando(false);
        }
      }
    }

    cargar();
    return () => {
      vigente = false;
    };
  }, [intento]);

  const reintentar = useCallback(() => {
    setError(null);
    setCargando(true);
    setIntento((anterior) => anterior + 1);
  }, []);

  return { libros, cargando, error, reintentar };
}
