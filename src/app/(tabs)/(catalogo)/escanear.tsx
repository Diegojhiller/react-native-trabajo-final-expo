import { useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AvisoEnApp } from '@/components/aviso-en-app';
import { IngresoIsbn } from '@/components/ingreso-isbn';
import { ZonaCamara } from '@/components/zona-camara';
import { colores, espacios } from '@/constants/tema';
import { usePermiso } from '@/hooks/usePermiso';
import { obtenerLibroPorIsbn } from '@/lib/catalogo';
import { esIsbnValido } from '@/lib/isbn';

/** Ruta "/escanear": lee el EAN-13 de la contratapa y abre ese libro. */
export default function Escanear() {
  const permiso = usePermiso(useCameraPermissions());
  // useRef y no useState: el cambio es inmediato y no espera al próximo render,
  // así los llamados siguientes de onBarcodeScanned ya lo ven.
  const yaNavego = useRef(false);
  const ultimoDesconocido = useRef<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  function abrirLibro(isbn: string) {
    yaNavego.current = true;
    // replace: el detalle ocupa el lugar del escáner, "atrás" vuelve al Catálogo.
    router.replace({ pathname: '/libro/[isbn]', params: { isbn } });
  }

  function alLeerCodigo({ data }: BarcodeScanningResult) {
    if (yaNavego.current || !esIsbnValido(data)) {
      return;
    }
    if (obtenerLibroPorIsbn(data)) {
      abrirLibro(data);
      return;
    }
    // El mismo código desconocido sigue frente a la cámara: avisamos una sola vez.
    if (ultimoDesconocido.current !== data) {
      ultimoDesconocido.current = data;
      setAviso(`El código ${data} no corresponde a ningún libro del catálogo. Probá con otro.`);
    }
  }

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled">
      <ZonaCamara
        estado={permiso.estado}
        onLeerCodigo={alLeerCodigo}
        onVerPermiso={() =>
          router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'camara' } })
        }
      />
      {aviso ? <AvisoEnApp texto={aviso} onDescartar={() => setAviso(null)} /> : null}
      <IngresoIsbn onAbrirLibro={abrirLibro} />
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
});
