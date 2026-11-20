import { StyleSheet, Text, View } from 'react-native';

import { colores, espacios, pesos, tamanos } from '@/constants/tema';

type Props = {
  etiqueta: string;
  valor: string;
};

/** Una fila "etiqueta: valor" de la ficha de un libro. */
export function DatoLibro({ etiqueta, valor }: Props) {
  return (
    <View style={styles.fila}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: espacios.m,
    paddingVertical: espacios.s,
    borderBottomWidth: tamanos.borde,
    borderBottomColor: colores.borde,
  },
  etiqueta: {
    fontSize: tamanos.texto,
    color: colores.textoSecundario,
  },
  valor: {
    flexShrink: 1,
    fontSize: tamanos.texto,
    fontWeight: pesos.semi,
    color: colores.texto,
    textAlign: 'right',
  },
});
