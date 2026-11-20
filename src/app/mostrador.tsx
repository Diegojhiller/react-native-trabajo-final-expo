import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { AvisoEnApp } from '@/components/aviso-en-app';
import { Boton } from '@/components/boton';
import { MensajeEstado } from '@/components/mensaje-estado';
import { TarjetaMostrador } from '@/components/tarjeta-mostrador';
import { MI_NOMBRE } from '@/constants/biblioteca';
import { colores, espacios } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { obtenerLibroPorIsbn } from '@/lib/catalogo';
import type { Libro } from '@/types';

type LibroEnEspera = { libro: Libro; frente: string; cantidad: number };

/** Ruta "/mostrador" (solo existe con sesión): entrega los libros respetando el orden de la Cola. */
export default function Mostrador() {
  const { esperas, entregarAlSiguiente, cerrarSesion } = useBiblioteca();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [entregando, setEntregando] = useState<string | null>(null);

  const conEspera: LibroEnEspera[] = [];
  for (const [isbn, cola] of Object.entries(esperas)) {
    const libro = obtenerLibroPorIsbn(isbn);
    const frente = cola.frente();
    if (libro && frente !== undefined) {
      conEspera.push({ libro, frente, cantidad: cola.tamanio });
    }
  }

  async function entregar(libro: Libro) {
    setEntregando(libro.isbn);
    // Simula que se devolvió un ejemplar: se desencola a la persona del frente.
    const persona = await entregarAlSiguiente(libro.isbn);
    setEntregando(null);
    if (persona === null) {
      setMensaje(`"${libro.titulo}" ya no tiene personas esperando.`);
    } else if (persona === MI_NOMBRE) {
      setMensaje(`Entregaste "${libro.titulo}" a la persona que usa la app. Le llega un aviso.`);
    } else {
      setMensaje(`Entregaste "${libro.titulo}" a ${persona}.`);
    }
  }

  return (
    <FlatList
      style={styles.lista}
      contentContainerStyle={styles.contenido}
      data={conEspera}
      keyExtractor={(item) => item.libro.isbn}
      renderItem={({ item }) => (
        <TarjetaMostrador
          titulo={item.libro.titulo}
          frente={item.frente}
          cantidad={item.cantidad}
          entregando={entregando === item.libro.isbn}
          onEntregar={() => entregar(item.libro)}
        />
      )}
      ListHeaderComponent={
        mensaje ? <AvisoEnApp texto={mensaje} onDescartar={() => setMensaje(null)} /> : undefined
      }
      ListEmptyComponent={
        <MensajeEstado
          icono="checkmark-done-circle"
          titulo="No hay libros con lista de espera"
          texto="Cuando alguien se anote para un libro sin ejemplares, va a aparecer acá."
        />
      }
      ListFooterComponent={
        <View style={styles.pie}>
          <Boton titulo="Cerrar sesión" icono="log-out" variante="peligro" onPress={cerrarSesion} />
        </View>
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
  pie: {
    marginTop: espacios.l,
  },
});
