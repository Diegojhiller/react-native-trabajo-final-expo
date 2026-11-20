import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espacios, pesos, radios, tamanos } from '@/constants/tema';
import type { Libro } from '@/types';

type Props = {
  libro: Libro;
  onPress: () => void;
};

/** Fila tocable de una lista de libros. */
export function FilaLibro({ libro, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${libro.titulo}, de ${libro.autor}`}
      accessibilityHint="Abre el detalle del libro"
      onPress={onPress}
      style={({ pressed }) => [styles.fila, pressed && styles.presionada]}>
      <View style={styles.textos}>
        <Text style={styles.titulo}>{libro.titulo}</Text>
        <Text style={styles.autor}>
          {libro.autor} · {libro.anio}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={tamanos.icono} color={colores.textoSecundario} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: {
    minHeight: tamanos.toqueMinimo,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacios.m,
    padding: espacios.m,
    borderRadius: radios.m,
    borderWidth: tamanos.borde,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  presionada: {
    opacity: 0.7,
  },
  textos: {
    flex: 1,
    gap: espacios.xs,
  },
  titulo: {
    fontSize: tamanos.textoGrande,
    fontWeight: pesos.semi,
    color: colores.texto,
  },
  autor: {
    fontSize: tamanos.textoChico,
    color: colores.textoSecundario,
  },
});
