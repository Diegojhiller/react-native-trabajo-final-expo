import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Boton } from '@/components/boton';
import { CampoTexto } from '@/components/campo-texto';
import { MENSAJES } from '@/constants/mensajes';
import { colores, espacios, pesos, tamanos } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';

/**
 * Modal "/login" (solo existe sin sesión). No llama a router.back(): al iniciar sesión
 * el guard de Stack.Protected pasa a false y el modal se cierra solo.
 */
export default function Login() {
  const { iniciarSesion } = useBiblioteca();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);

  function ingresar() {
    if (!iniciarSesion(usuario, clave)) {
      setError(MENSAJES.loginIncorrecto);
    }
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.texto}>Ingreso exclusivo para el personal de la biblioteca.</Text>
      <CampoTexto
        etiqueta="Usuario"
        value={usuario}
        onChangeText={setUsuario}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="username"
      />
      <CampoTexto
        etiqueta="Clave"
        value={clave}
        onChangeText={setClave}
        secureTextEntry
        textContentType="password"
        onSubmitEditing={ingresar}
      />
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <Boton titulo="Ingresar" icono="log-in" onPress={ingresar} />
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
  texto: {
    fontSize: tamanos.textoGrande,
    color: colores.textoSecundario,
  },
  error: {
    fontSize: tamanos.texto,
    fontWeight: pesos.semi,
    color: colores.peligro,
  },
});
