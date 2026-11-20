import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { colores, espacios, pesos, radios, tamanos } from '@/constants/tema';

type Props = {
  titulo: string;
  frente: string;
  cantidad: number;
  entregando: boolean;
  onEntregar: () => void;
};

/** Un libro con lista de espera: quién está al frente y cuántas personas esperan. */
export function TarjetaMostrador({ titulo, frente, cantidad, entregando, onEntregar }: Props) {
  return (
    <View style={styles.tarjeta}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.texto}>
        Al frente: <Text style={styles.destacado}>{frente}</Text>
      </Text>
      <Text style={styles.texto}>
        {cantidad === 1 ? 'Espera 1 persona' : `Esperan ${cantidad} personas`}
      </Text>
      <Boton
        titulo="Entregar al siguiente"
        icono="hand-right"
        deshabilitado={entregando}
        onPress={onEntregar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    padding: espacios.l,
    gap: espacios.s,
    borderRadius: radios.l,
    backgroundColor: colores.superficie,
    borderWidth: tamanos.borde,
    borderColor: colores.borde,
  },
  titulo: {
    fontSize: tamanos.textoGrande,
    fontWeight: pesos.negrita,
    color: colores.texto,
  },
  texto: {
    fontSize: tamanos.texto,
    color: colores.textoSecundario,
  },
  destacado: {
    fontWeight: pesos.negrita,
    color: colores.texto,
  },
});
