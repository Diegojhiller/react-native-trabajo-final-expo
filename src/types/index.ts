export type Libro = {
  isbn: string; // 13 dígitos, sin guiones
  titulo: string;
  autor: string;
  anio: number;
  ejemplares: number; // ejemplares en el estante al iniciar la app
};

/** De dónde salió el ejemplar que tiene la persona. */
export type OrigenPrestamo = 'estante' | 'mostrador';

export type Prestamo = {
  isbn: string;
  /** Fecha de devolución, en milisegundos desde 1970. */
  vence: number;
  /** Identificador de la notificación programada, o null si "Recordarme" está apagado. */
  recordatorioId: string | null;
  origen: OrigenPrestamo;
};

/** Mensaje que se muestra dentro de la app cuando no hay permiso de notificaciones. */
export type Aviso = {
  id: string;
  texto: string;
};

export type ResultadoReserva =
  | { tipo: 'prestamo'; vence: number }
  | { tipo: 'espera'; posicion: number }
  | { tipo: 'repetida' };

export type Recurso = 'camara' | 'notificaciones';

export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';
