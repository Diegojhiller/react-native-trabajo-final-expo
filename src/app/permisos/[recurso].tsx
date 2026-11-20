import Ionicons from '@expo/vector-icons/Ionicons';
import { useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Cargando } from '@/components/cargando';
import { MensajeEstado } from '@/components/mensaje-estado';
import { TEXTOS_PERMISO } from '@/constants/permisos';
import { colores, espacios, pesos, tamanos } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';
import { usePermiso } from '@/hooks/usePermiso';
import { usePermisosNotificaciones } from '@/hooks/usePermisosNotificaciones';
import { esRecurso } from '@/lib/permisos';

/**
 * Modal "/permisos/[recurso]": pantalla previa al diálogo del sistema.
 * El beneficio en una frase y un único botón: "Continuar" o, si está bloqueado, "Abrir Ajustes".
 * Para notificaciones recibe ?isbn= del préstamo cuyo recordatorio se quiere activar.
 */
export default function PantallaPermiso() {
  const { recurso, isbn } = useLocalSearchParams<{ recurso: string; isbn?: string }>();
  const camara = usePermiso(useCameraPermissions());
  const notificaciones = usePermiso(usePermisosNotificaciones());
  const { activarRecordatorio, agregarAviso } = useBiblioteca();
  const [pidiendo, setPidiendo] = useState(false);

  if (!esRecurso(recurso)) {
    return (
      <ScrollView
        style={styles.pantalla}
        contentContainerStyle={styles.contenido}
        contentInsetAdjustmentBehavior="automatic">
        <MensajeEstado icono="help-circle" titulo="No reconocemos ese permiso">
          <Boton titulo="Volver" onPress={() => router.back()} />
        </MensajeEstado>
      </ScrollView>
    );
  }

  const permiso = recurso === 'camara' ? camara : notificaciones;
  const textos = TEXTOS_PERMISO[recurso];
  const paraRecordatorio = recurso === 'notificaciones' && isbn !== undefined;

  async function continuar() {
    setPidiendo(true);
    const respuesta = await permiso.pedir();
    if (paraRecordatorio && isbn) {
      if (respuesta.granted) {
        await activarRecordatorio(isbn);
      } else {
        agregarAviso('No activamos el recordatorio porque las notificaciones están desactivadas. Revisá la fecha de devolución acá.');
      }
    }
    router.back();
  }

  async function activarYVolver() {
    if (paraRecordatorio && isbn) {
      await activarRecordatorio(isbn);
    }
    router.back();
  }

  if (permiso.estado === 'cargando') {
    return <Cargando texto="Revisando el permiso…" />;
  }

  if (permiso.estado === 'concedido') {
    return (
      <ScrollView
        style={styles.pantalla}
        contentContainerStyle={styles.contenido}
        contentInsetAdjustmentBehavior="automatic">
        <MensajeEstado icono="checkmark-circle" titulo="¡Listo! El permiso está activado.">
          <Boton
            titulo={paraRecordatorio ? 'Activar el recordatorio' : 'Volver'}
            onPress={activarYVolver}
          />
        </MensajeEstado>
      </ScrollView>
    );
  }

  const bloqueado = permiso.estado === 'bloqueado';

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      contentInsetAdjustmentBehavior="automatic">
      <View style={styles.icono}>
        <Ionicons name={textos.icono} size={tamanos.iconoGrande} color={colores.primario} />
      </View>
      <Text style={styles.titulo} accessibilityRole="header">
        {textos.titulo}
      </Text>
      <Text style={styles.texto}>{bloqueado ? textos.bloqueado : textos.beneficio}</Text>
      {bloqueado ? (
        <Boton titulo="Abrir Ajustes" icono="settings" onPress={() => Linking.openSettings()} />
      ) : (
        <Boton titulo="Continuar" deshabilitado={pidiendo} onPress={continuar} />
      )}
      <Text style={styles.nota}>Podés cambiar esta decisión cuando quieras en Ajustes.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: espacios.xl,
    gap: espacios.l,
  },
  icono: {
    alignItems: 'center',
    paddingTop: espacios.xl,
  },
  titulo: {
    fontSize: tamanos.titulo,
    fontWeight: pesos.extra,
    color: colores.texto,
    textAlign: 'center',
  },
  texto: {
    fontSize: tamanos.textoGrande,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  nota: {
    fontSize: tamanos.textoChico,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
});
