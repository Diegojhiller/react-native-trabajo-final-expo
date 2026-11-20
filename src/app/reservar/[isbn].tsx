import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { MensajeEstado } from '@/components/mensaje-estado';
import { DIAS_PRESTAMO } from '@/constants/biblioteca';
import { colores, espacios } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { obtenerLibroPorIsbn } from '@/lib/catalogo';
import { esIsbnValido } from '@/lib/isbn';

/** Modal "/reservar/[isbn]": préstamo por 7 días si hay ejemplares; si no, lista de espera. */
export default function ConfirmarReserva() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const libro = esIsbnValido(isbn) ? obtenerLibroPorIsbn(isbn) : undefined;
  const { reservar, yaReservado, disponibles, personasEsperando } = useBiblioteca();
  // Evita que, al confirmar, la pantalla muestre "ya reservado" mientras se cierra.
  const [confirmado, setConfirmado] = useState(false);

  if (!libro) {
    return (
      <ScrollView
        style={styles.pantalla}
        contentContainerStyle={styles.contenido}
        contentInsetAdjustmentBehavior="automatic">
        <MensajeEstado
          icono="help-circle"
          titulo="No encontramos ese libro"
          texto="Revisá el ISBN o elegí el libro desde el Catálogo.">
          <Boton titulo="Cerrar" onPress={() => router.back()} />
        </MensajeEstado>
      </ScrollView>
    );
  }

  if (yaReservado(libro.isbn) && !confirmado) {
    return (
      <ScrollView
        style={styles.pantalla}
        contentContainerStyle={styles.contenido}
        contentInsetAdjustmentBehavior="automatic">
        <MensajeEstado
          icono="bookmark"
          titulo="Ya reservaste este libro"
          texto={`"${libro.titulo}" ya está en tus préstamos o en tu lista de espera. No se puede reservar dos veces.`}>
          <Boton titulo="Ver mis reservas" onPress={() => router.dismissTo('/reservas')} />
          <Boton titulo="Cerrar" variante="secundario" onPress={() => router.back()} />
        </MensajeEstado>
      </ScrollView>
    );
  }

  const enFila = personasEsperando(libro.isbn);
  const hayEjemplar = disponibles(libro) > 0 && enFila === 0;

  function confirmar() {
    if (!libro) {
      return;
    }
    setConfirmado(true);
    reservar(libro);
    // Vuelve a las pestañas sacando el modal de la pila: "atrás" no regresa a esta pantalla.
    router.dismissTo('/reservas');
  }

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      contentInsetAdjustmentBehavior="automatic">
      {hayEjemplar ? (
        <MensajeEstado
          icono="book"
          titulo={libro.titulo}
          texto={`Hay un ejemplar para vos. Te lo prestamos por ${DIAS_PRESTAMO} días.`}
        />
      ) : (
        <MensajeEstado
          icono="people"
          titulo={libro.titulo}
          texto={`No quedan ejemplares. Vas a entrar a la lista de espera en la posición ${enFila + 1}.`}
        />
      )}
      <Boton
        titulo={hayEjemplar ? 'Confirmar préstamo' : 'Anotarme en la lista'}
        icono="checkmark"
        deshabilitado={confirmado}
        onPress={confirmar}
      />
      <Boton titulo="Cancelar" variante="secundario" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: espacios.l,
    gap: espacios.m,
  },
});
