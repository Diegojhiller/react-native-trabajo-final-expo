import { StyleSheet, Text, View } from 'react-native';

import { colores, espacios, pesos, radios, tamanos } from '@/constants/tema';
import type { Libro } from '@/types';

type Props = {
  libro: Libro;
  posicion: number;
  total: number;
};

/** Una reserva en lista de espera, con la posición de la persona en la Cola. */
export function TarjetaEspera({ libro, posicion, total }: Props) {
  return (
    <View style={styles.tarjeta}>
      <Text style={styles.etiqueta}>En espera</Text>
      <Text style={styles.titulo}>{libro.titulo}</Text>
      <Text style={styles.texto}>
        Estás en la posición {posicion} de {total}.
        {posicion === 1 ? ' ¡Sos la próxima persona!' : ''}
      </Text>
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
  etiqueta: {
    fontSize: tamanos.subtitulo,
    fontWeight: pesos.negrita,
    color: colores.alerta,
    textTransform: 'uppercase',
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
});
