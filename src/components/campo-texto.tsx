import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colores, espacios, pesos, radios, tamanos } from '@/constants/tema';

type Props = Omit<TextInputProps, 'style' | 'accessibilityLabel'> & {
  etiqueta: string;
};

/** Campo de texto con su etiqueta visible (que también lee el lector de pantalla). */
export function CampoTexto({ etiqueta, ...resto }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        placeholderTextColor={colores.textoSecundario}
        style={styles.campo}
        {...resto}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espacios.xs,
  },
  etiqueta: {
    fontSize: tamanos.textoChico,
    fontWeight: pesos.semi,
    color: colores.textoSecundario,
  },
  campo: {
    minHeight: tamanos.toqueMinimo,
    paddingHorizontal: espacios.m,
    paddingVertical: espacios.m,
    borderWidth: tamanos.borde,
    borderColor: colores.borde,
    borderRadius: radios.m,
    backgroundColor: colores.superficie,
    fontSize: tamanos.textoGrande,
    color: colores.texto,
  },
});
