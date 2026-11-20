import { createContext, use, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  CANTIDAD_RECIENTES,
  CLAVE_PERSONAL,
  DIAS_PRESTAMO,
  MI_NOMBRE,
  USUARIO_PERSONAL,
} from '@/constants/biblioteca';
import { Cola } from '@/estructuras/Cola';
import { Pila } from '@/estructuras/Pila';
import { crearEsperasIniciales, obtenerLibroPorIsbn } from '@/lib/catalogo';
import { sumarDias } from '@/lib/fechas';
import {
  avisarEntrega,
  cancelarRecordatorio,
  notificacionesPermitidas,
  programarRecordatorio,
} from '@/lib/notificaciones';
import { recientesDesdeElTope } from '@/lib/recientes';
import type { Aviso, Libro, Prestamo, ResultadoReserva } from '@/types';

type ValorBiblioteca = {
  prestamos: Prestamo[];
  esperas: Record<string, Cola<string>>;
  /** ISBN de los últimos libros vistos, del más reciente al más antiguo. */
  recientes: string[];
  avisos: Aviso[];
  sesion: boolean;
  registrarVisto: (isbn: string) => void;
  disponibles: (libro: Libro) => number;
  personasEsperando: (isbn: string) => number;
  posicionEnEspera: (isbn: string) => number | null;
  yaReservado: (isbn: string) => boolean;
  reservar: (libro: Libro) => ResultadoReserva;
  devolver: (isbn: string) => Promise<void>;
  activarRecordatorio: (isbn: string) => Promise<void>;
  desactivarRecordatorio: (isbn: string) => Promise<void>;
  agregarAviso: (texto: string) => void;
  descartarAviso: (id: string) => void;
  entregarAlSiguiente: (isbn: string) => Promise<string | null>;
  iniciarSesion: (usuario: string, clave: string) => boolean;
  cerrarSesion: () => void;
};

const BibliotecaContext = createContext<ValorBiblioteca | null>(null);

/**
 * Estado global de la app. Pila y Cola son objetos mutables: React no se entera si se
 * modifican por dentro. Por eso nunca se mutan las instancias que están en el estado:
 * cada cambio crea una instancia nueva a partir de la anterior (aArray) y la reemplaza.
 */
export function BibliotecaProvider({ children }: { children: ReactNode }) {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [esperas, setEsperas] = useState<Record<string, Cola<string>>>(crearEsperasIniciales);
  const [pilaRecientes, setPilaRecientes] = useState(() => new Pila<string>());
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [sesion, setSesion] = useState(false);
  const siguienteAviso = useRef(1);

  const registrarVisto = useCallback((isbn: string) => {
    setPilaRecientes((anterior) => {
      if (anterior.tope() === isbn) {
        return anterior;
      }
      const nueva = new Pila(anterior.aArray());
      nueva.push(isbn);
      return nueva;
    });
  }, []);

  const disponibles = useCallback(
    (libro: Libro) =>
      libro.ejemplares -
      prestamos.filter((p) => p.isbn === libro.isbn && p.origen === 'estante').length,
    [prestamos],
  );

  const personasEsperando = useCallback(
    (isbn: string) => esperas[isbn]?.tamanio ?? 0,
    [esperas],
  );

  const posicionEnEspera = useCallback(
    (isbn: string) => {
      const indice = esperas[isbn]?.aArray().indexOf(MI_NOMBRE) ?? -1;
      return indice === -1 ? null : indice + 1;
    },
    [esperas],
  );

  const yaReservado = useCallback(
    (isbn: string) => prestamos.some((p) => p.isbn === isbn) || posicionEnEspera(isbn) !== null,
    [prestamos, posicionEnEspera],
  );

  const reservar = useCallback(
    (libro: Libro): ResultadoReserva => {
      if (yaReservado(libro.isbn)) {
        return { tipo: 'repetida' };
      }
      const cola = esperas[libro.isbn];
      const hayFila = cola !== undefined && !cola.vacia;

      if (disponibles(libro) > 0 && !hayFila) {
        const vence = sumarDias(Date.now(), DIAS_PRESTAMO);
        const nuevo: Prestamo = { isbn: libro.isbn, vence, recordatorioId: null, origen: 'estante' };
        setPrestamos((anteriores) =>
          anteriores.some((p) => p.isbn === libro.isbn) ? anteriores : [...anteriores, nuevo],
        );
        return { tipo: 'prestamo', vence };
      }

      const nueva = new Cola(cola?.aArray() ?? []);
      nueva.encolar(MI_NOMBRE);
      setEsperas((anteriores) => ({ ...anteriores, [libro.isbn]: nueva }));
      return { tipo: 'espera', posicion: nueva.tamanio };
    },
    [esperas, disponibles, yaReservado],
  );

  const devolver = useCallback(
    async (isbn: string) => {
      const prestamo = prestamos.find((p) => p.isbn === isbn);
      setPrestamos((anteriores) => anteriores.filter((p) => p.isbn !== isbn));
      if (prestamo?.recordatorioId) {
        await cancelarRecordatorio(prestamo.recordatorioId);
      }
    },
    [prestamos],
  );

  const activarRecordatorio = useCallback(
    async (isbn: string) => {
      const prestamo = prestamos.find((p) => p.isbn === isbn);
      const libro = obtenerLibroPorIsbn(isbn);
      if (!prestamo || prestamo.recordatorioId || !libro) {
        return;
      }
      const id = await programarRecordatorio(libro.titulo);
      setPrestamos((anteriores) =>
        anteriores.map((p) => (p.isbn === isbn ? { ...p, recordatorioId: id } : p)),
      );
    },
    [prestamos],
  );

  const desactivarRecordatorio = useCallback(
    async (isbn: string) => {
      const id = prestamos.find((p) => p.isbn === isbn)?.recordatorioId;
      setPrestamos((anteriores) =>
        anteriores.map((p) => (p.isbn === isbn ? { ...p, recordatorioId: null } : p)),
      );
      if (id) {
        await cancelarRecordatorio(id);
      }
    },
    [prestamos],
  );

  const agregarAviso = useCallback((texto: string) => {
    const id = String(siguienteAviso.current);
    siguienteAviso.current += 1;
    setAvisos((anteriores) => [{ id, texto }, ...anteriores]);
  }, []);

  const descartarAviso = useCallback((id: string) => {
    setAvisos((anteriores) => anteriores.filter((aviso) => aviso.id !== id));
  }, []);

  const entregarAlSiguiente = useCallback(
    async (isbn: string) => {
      const cola = esperas[isbn];
      if (!cola || cola.vacia) {
        return null;
      }
      const nueva = new Cola(cola.aArray());
      const persona = nueva.desencolar() ?? null;
      setEsperas((anteriores) => ({ ...anteriores, [isbn]: nueva }));

      if (persona === MI_NOMBRE) {
        const nuevo: Prestamo = {
          isbn,
          vence: sumarDias(Date.now(), DIAS_PRESTAMO),
          recordatorioId: null,
          origen: 'mostrador',
        };
        setPrestamos((anteriores) =>
          anteriores.some((p) => p.isbn === isbn) ? anteriores : [...anteriores, nuevo],
        );
        const titulo = obtenerLibroPorIsbn(isbn)?.titulo ?? 'tu libro';
        if (await notificacionesPermitidas()) {
          await avisarEntrega(titulo);
        } else {
          agregarAviso(`¡Ya podés retirar "${titulo}"! Te lo prestamos por ${DIAS_PRESTAMO} días.`);
        }
      }
      return persona;
    },
    [esperas, agregarAviso],
  );

  const iniciarSesion = useCallback((usuario: string, clave: string) => {
    const correcto = usuario.trim() === USUARIO_PERSONAL && clave === CLAVE_PERSONAL;
    if (correcto) {
      setSesion(true);
    }
    return correcto;
  }, []);

  const cerrarSesion = useCallback(() => setSesion(false), []);

  const recientes = useMemo(
    () => recientesDesdeElTope(pilaRecientes, CANTIDAD_RECIENTES),
    [pilaRecientes],
  );

  const valor = useMemo<ValorBiblioteca>(
    () => ({
      prestamos,
      esperas,
      recientes,
      avisos,
      sesion,
      registrarVisto,
      disponibles,
      personasEsperando,
      posicionEnEspera,
      yaReservado,
      reservar,
      devolver,
      activarRecordatorio,
      desactivarRecordatorio,
      agregarAviso,
      descartarAviso,
      entregarAlSiguiente,
      iniciarSesion,
      cerrarSesion,
    }),
    [
      prestamos,
      esperas,
      recientes,
      avisos,
      sesion,
      registrarVisto,
      disponibles,
      personasEsperando,
      posicionEnEspera,
      yaReservado,
      reservar,
      devolver,
      activarRecordatorio,
      desactivarRecordatorio,
      agregarAviso,
      descartarAviso,
      entregarAlSiguiente,
      iniciarSesion,
      cerrarSesion,
    ],
  );

  return <BibliotecaContext value={valor}>{children}</BibliotecaContext>;
}

export function useBiblioteca(): ValorBiblioteca {
  const valor = use(BibliotecaContext);
  if (!valor) {
    throw new Error('useBiblioteca debe usarse dentro de <BibliotecaProvider>');
  }
  return valor;
}
