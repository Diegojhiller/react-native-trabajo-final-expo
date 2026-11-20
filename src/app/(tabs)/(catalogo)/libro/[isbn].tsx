import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvisoEnApp } from '@/components/aviso-en-app';
import { Boton } from '@/components/boton';
import { DatoLibro } from '@/components/dato-libro';
import { MensajeEstado } from '@/components/mensaje-estado';
import { colores, espacios, pesos, radios, tamanos } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { obtenerLibroPorIsbn } from '@/lib/catalogo';
import { esIsbnValido } from '@/lib/isbn';

/** Ruta "/libro/[isbn]". La ruta acepta cualquier texto: validar el ISBN es trabajo nuestro. */
export default function DetalleLibro() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const formatoValido = esIsbnValido(isbn);
  const libro = formatoValido ? obtenerLibroPorIsbn(isbn) : undefined;
  const { registrarVisto, disponibles, personasEsperando, posicionEnEspera, prestamos } =
    useBiblioteca();

  useEffect(() => {
    if (libro) {
      registrarVisto(libro.isbn);
    }
  }, [libro, registrarVisto]);

  if (!libro) {
    return (
      <View style={styles.pantalla}>
        <Stack.Screen options={{ title: 'Libro no encontrado' }} />
        <MensajeEstado
          icono="help-circle"
          titulo={formatoValido ? 'No encontramos ese libro' : 'Ese ISBN no es válido'}
          texto={
            formatoValido
              ? `No hay ningún libro con ISBN ${isbn} en el catálogo.`
              : `"${isbn}" no es un ISBN: tiene que tener 13 números.`
          }>
          <Link href="/" dismissTo style={styles.enlace}>
            Volver al Catálogo
          </Link>
        </MensajeEstado>
      </View>
    );
  }

  const enEspera = posicionEnEspera(libro.isbn);
  const tengoPrestamo = prestamos.some((p) => p.isbn === libro.isbn);

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido}>
      <Stack.Screen options={{ title: libro.titulo }} />
      <View style={styles.ficha}>
        <Text style={styles.titulo} accessibilityRole="header">
          {libro.titulo}
        </Text>
        <DatoLibro etiqueta="Autor" valor={libro.autor} />
        <DatoLibro etiqueta="Año" valor={String(libro.anio)} />
        <DatoLibro etiqueta="Ejemplares disponibles" valor={String(disponibles(libro))} />
        <DatoLibro etiqueta="En lista de espera" valor={String(personasEsperando(libro.isbn))} />
      </View>

      {tengoPrestamo ? <AvisoEnApp texto="Tenés este libro en préstamo." /> : null}
      {enEspera !== null ? (
        <AvisoEnApp texto={`Estás en la posición ${enEspera} de la lista de espera.`} />
      ) : null}

      <Boton
        titulo="Reservar"
        icono="bookmark"
        onPress={() => router.push({ pathname: '/reservar/[isbn]', params: { isbn: libro.isbn } })}
      />
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
    gap: espacios.l,
  },
  ficha: {
    padding: espacios.l,
    gap: espacios.xs,
    borderRadius: radios.l,
    backgroundColor: colores.superficie,
  },
  titulo: {
    fontSize: tamanos.tituloGrande,
    fontWeight: pesos.extra,
    color: colores.texto,
    marginBottom: espacios.s,
  },
  enlace: {
    minHeight: tamanos.toqueMinimo,
    paddingVertical: espacios.m,
    fontSize: tamanos.textoGrande,
    fontWeight: pesos.negrita,
    color: colores.primario,
    textAlign: 'center',
  },
});
