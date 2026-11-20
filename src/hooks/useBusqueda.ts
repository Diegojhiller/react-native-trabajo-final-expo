import { useCallback, useEffect, useState } from 'react';

import { MENSAJES } from '@/constants/mensajes';
import { buscarLibros } from '@/lib/api';
import type { Libro } from '@/types';

/** Respuesta asociada a la consulta que la originó. */
type Respuesta =
  | { consulta: string; libros: Libro[]; error: null }
  | { consulta: string; libros: []; error: string };

type ResultadoBusqueda = {
  resultados: Libro[];
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
};

/**
 * Busca libros por título o autor. Solo pueden verse los resultados de la ÚLTIMA búsqueda:
 * la limpieza del efecto descarta las respuestas viejas aunque lleguen desordenadas.
 */
export function useBusqueda(q: string): ResultadoBusqueda {
  const consulta = q.trim();
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (consulta === '') {
      return;
    }
    let vigente = true;

    buscarLibros(consulta)
      .then((libros) => {
        if (vigente) {
          setRespuesta({ consulta, libros, error: null });
        }
      })
      .catch(() => {
        if (vigente) {
          setRespuesta({ consulta, libros: [], error: MENSAJES.errorBusqueda });
        }
      });

    // Se ejecuta antes del próximo efecto (cuando cambia q) y al desmontar.
    return () => {
      vigente = false;
    };
  }, [consulta, intento]);

  const reintentar = useCallback(() => {
    setRespuesta(null);
    setIntento((anterior) => anterior + 1);
  }, []);

  const alDia = respuesta !== null && respuesta.consulta === consulta;

  return {
    resultados: alDia ? respuesta.libros : [],
    cargando: consulta !== '' && !alDia,
    error: alDia ? respuesta.error : null,
    reintentar,
  };
}
