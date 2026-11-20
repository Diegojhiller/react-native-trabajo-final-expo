import { CameraView, type BarcodeScanningResult, type BarcodeSettings } from 'expo-camera';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Cargando } from '@/components/cargando';
import { MensajeEstado } from '@/components/mensaje-estado';
import { colores, espacios, radios, tamanos } from '@/constants/tema';
import type { EstadoPermiso } from '@/types';

/** Solo códigos EAN-13: el formato del código de barras de la contratapa. */
const AJUSTES_ESCANER: BarcodeSettings = { barcodeTypes: ['ean13'] };

type Props = {
  estado: EstadoPermiso;
  onLeerCodigo: (resultado: BarcodeScanningResult) => void;
  onVerPermiso: () => void;
};

/** Lo que se ve arriba del escáner según el estado del permiso de cámara. */
export function ZonaCamara({ estado, onLeerCodigo, onVerPermiso }: Props) {
  if (estado === 'cargando') {
    return <Cargando texto="Revisando el permiso de la cámara…" />;
  }

  if (estado === 'concedido') {
    return (
      <View style={styles.marco}>
        <CameraView
          style={styles.camara}
          facing="back"
          barcodeScannerSettings={AJUSTES_ESCANER}
          onBarcodeScanned={onLeerCodigo}
        />
        <Text style={styles.ayuda}>Apuntá al código de barras de la contratapa.</Text>
      </View>
    );
  }

  if (estado === 'preguntable') {
    return (
      <MensajeEstado
        icono="camera"
        titulo="Escaneá el código del libro"
        texto="Con la cámara leemos el código de barras y abrimos el libro al instante.">
        <Boton titulo="Usar la cámara" icono="camera" onPress={onVerPermiso} />
      </MensajeEstado>
    );
  }

  return (
    <MensajeEstado
      icono="videocam-off"
      titulo="La cámara está desactivada"
      texto="Podés activarla en Ajustes o escribir el ISBN a mano acá abajo.">
      <Boton titulo="Cómo activarla" icono="settings" variante="secundario" onPress={onVerPermiso} />
    </MensajeEstado>
  );
}

const styles = StyleSheet.create({
  marco: {
    gap: espacios.s,
  },
  camara: {
    height: tamanos.alturaCamara,
    borderRadius: radios.l,
    overflow: 'hidden',
    backgroundColor: colores.camara,
  },
  ayuda: {
    fontSize: tamanos.texto,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
});
