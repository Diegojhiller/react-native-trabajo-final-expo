import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colores, espacios, tamanos } from '@/constants/tema';

/** Indicador de carga con un texto que explica qué se está esperando. */
export function Cargando({ texto }: { texto: string }) {
  return (
    <View style={styles.contenedor} accessibilityRole="progressbar" accessibilityLabel={texto}>
      <ActivityIndicator size="large" color={colores.primario} />
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    gap: espacios.m,
    paddingVertical: espacios.xxl,
  },
  texto: {
    fontSize: tamanos.texto,
    color: colores.textoSecundario,
  },
});
