import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espacios, pesos, radios, tamanos } from '@/constants/tema';
import type { Libro } from '@/types';

type Props = {
  libros: Libro[];
  onAbrirLibro: (isbn: string) => void;
};

/** Los últimos libros abiertos (tope de la Pila), del más reciente al más antiguo. */
export function VistosRecientemente({ libros, onAbrirLibro }: Props) {
  if (libros.length === 0) {
    return null;
  }
  return (
    <View style={styles.seccion}>
      <Text style={styles.subtitulo} accessibilityRole="header">
        Vistos recientemente
      </Text>
      <View style={styles.fila}>
        {libros.map((libro) => (
          <Pressable
            key={libro.isbn}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${libro.titulo}`}
            onPress={() => onAbrirLibro(libro.isbn)}
            style={({ pressed }) => [styles.tarjeta, pressed && styles.presionada]}>
            <Text style={styles.titulo} numberOfLines={2}>
              {libro.titulo}
            </Text>
            <Text style={styles.autor} numberOfLines={1}>
              {libro.autor}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: {
    gap: espacios.s,
  },
  subtitulo: {
    fontSize: tamanos.subtitulo,
    fontWeight: pesos.negrita,
    color: colores.textoSecundario,
    textTransform: 'uppercase',
  },
  fila: {
    flexDirection: 'row',
    gap: espacios.s,
  },
  tarjeta: {
    flex: 1,
    minHeight: tamanos.toqueMinimo,
    padding: espacios.s,
    gap: espacios.xs,
    borderRadius: radios.s,
    backgroundColor: colores.primarioSuave,
  },
  presionada: {
    opacity: 0.7,
  },
  titulo: {
    fontSize: tamanos.textoChico,
    fontWeight: pesos.negrita,
    color: colores.primario,
  },
  autor: {
    fontSize: tamanos.textoChico,
    color: colores.textoSecundario,
  },
});
