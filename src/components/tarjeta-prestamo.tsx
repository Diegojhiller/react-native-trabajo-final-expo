import { StyleSheet, Switch, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { SEGUNDOS_RECORDATORIO } from '@/constants/biblioteca';
import { colores, espacios, pesos, radios, tamanos } from '@/constants/tema';
import { formatearFecha } from '@/lib/fechas';
import type { Libro, Prestamo } from '@/types';

type Props = {
  libro: Libro;
  prestamo: Prestamo;
  onCambiarRecordatorio: (activo: boolean) => void;
  onDevolver: () => void;
};

/** Un préstamo: fecha de devolución, interruptor "Recordarme" y botón "Devolver". */
export function TarjetaPrestamo({ libro, prestamo, onCambiarRecordatorio, onDevolver }: Props) {
  const recordatorioActivo = prestamo.recordatorioId !== null;

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.etiqueta}>Préstamo</Text>
      <Text style={styles.titulo}>{libro.titulo}</Text>
      <Text style={styles.texto}>Devolvelo antes del {formatearFecha(prestamo.vence)}.</Text>
      <View style={styles.fila}>
        <View style={styles.textosInterruptor}>
          <Text style={styles.textoInterruptor}>Recordarme</Text>
          <Text style={styles.nota}>
            Modo demostración: el aviso llega a los {SEGUNDOS_RECORDATORIO} segundos.
          </Text>
        </View>
        <Switch
          accessibilityLabel={`Recordarme la devolución de ${libro.titulo}`}
          value={recordatorioActivo}
          onValueChange={onCambiarRecordatorio}
          trackColor={{ false: colores.interruptorApagado, true: colores.primario }}
        />
      </View>
      <Boton titulo="Devolver" icono="return-down-back" variante="peligro" onPress={onDevolver} />
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
    color: colores.exito,
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
  fila: {
    minHeight: tamanos.toqueMinimo,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacios.m,
  },
  textosInterruptor: {
    flex: 1,
  },
  textoInterruptor: {
    fontSize: tamanos.texto,
    fontWeight: pesos.semi,
    color: colores.texto,
  },
  nota: {
    fontSize: tamanos.textoChico,
    color: colores.textoSecundario,
  },
});
