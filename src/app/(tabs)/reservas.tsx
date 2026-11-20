import { router } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';

import { AvisosReservas } from '@/components/avisos-reservas';
import { Boton } from '@/components/boton';
import { MensajeEstado } from '@/components/mensaje-estado';
import { TarjetaEspera } from '@/components/tarjeta-espera';
import { TarjetaPrestamo } from '@/components/tarjeta-prestamo';
import { MI_NOMBRE } from '@/constants/biblioteca';
import { colores, espacios } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { usePermiso } from '@/hooks/usePermiso';
import { usePermisosNotificaciones } from '@/hooks/usePermisosNotificaciones';
import { obtenerLibroPorIsbn } from '@/lib/catalogo';
import type { Libro, Prestamo } from '@/types';

/** Un libro nunca está a la vez en préstamo y en espera, así que el ISBN sirve de key. */
type ItemReserva =
  | { tipo: 'prestamo'; libro: Libro; prestamo: Prestamo }
  | { tipo: 'espera'; libro: Libro; posicion: number; total: number };

/** Ruta "/reservas": préstamos, reservas en espera y avisos dentro de la app. */
export default function MisReservas() {
  const {
    prestamos,
    esperas,
    avisos,
    descartarAviso,
    devolver,
    activarRecordatorio,
    desactivarRecordatorio,
  } = useBiblioteca();
  const notificaciones = usePermiso(usePermisosNotificaciones());

  const items: ItemReserva[] = [];
  for (const prestamo of prestamos) {
    const libro = obtenerLibroPorIsbn(prestamo.isbn);
    if (libro) {
      items.push({ tipo: 'prestamo', libro, prestamo });
    }
  }
  for (const [isbn, cola] of Object.entries(esperas)) {
    const posicion = cola.aArray().indexOf(MI_NOMBRE) + 1;
    const libro = obtenerLibroPorIsbn(isbn);
    if (posicion > 0 && libro) {
      items.push({ tipo: 'espera', libro, posicion, total: cola.tamanio });
    }
  }

  function cambiarRecordatorio(isbn: string, activo: boolean) {
    if (!activo) {
      desactivarRecordatorio(isbn);
      return;
    }
    if (notificaciones.estado === 'concedido') {
      activarRecordatorio(isbn);
      return;
    }
    // El permiso se pide recién acá, al activar "Recordarme", con la pantalla previa.
    router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'notificaciones', isbn } });
  }

  return (
    <FlatList
      style={styles.lista}
      contentContainerStyle={styles.contenido}
      data={items}
      keyExtractor={(item) => item.libro.isbn}
      renderItem={({ item }) =>
        item.tipo === 'prestamo' ? (
          <TarjetaPrestamo
            libro={item.libro}
            prestamo={item.prestamo}
            onCambiarRecordatorio={(activo) => cambiarRecordatorio(item.libro.isbn, activo)}
            onDevolver={() => devolver(item.libro.isbn)}
          />
        ) : (
          <TarjetaEspera libro={item.libro} posicion={item.posicion} total={item.total} />
        )
      }
      ListHeaderComponent={
        <AvisosReservas
          avisos={avisos}
          notificacionesBloqueadas={notificaciones.estado === 'bloqueado'}
          onDescartar={descartarAviso}
        />
      }
      ListEmptyComponent={
        <MensajeEstado
          icono="bookmarks-outline"
          titulo="Todavía no reservaste libros"
          texto="Buscá un libro en el Catálogo y tocá Reservar.">
          <Boton titulo="Ir al Catálogo" icono="library" onPress={() => router.navigate('/')} />
        </MensajeEstado>
      }
    />
  );
}

const styles = StyleSheet.create({
  lista: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: espacios.l,
    gap: espacios.m,
  },
});
