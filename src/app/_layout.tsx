import { StatusBar } from 'expo-status-bar';

import { NavegacionRaiz } from '@/components/navegacion-raiz';
import { BibliotecaProvider } from '@/context/BibliotecaContext';
import { configurarNotificaciones } from '@/lib/notificaciones';

configurarNotificaciones();

/** Si se entra por un deep link (por ejemplo a /buscar), las pestañas quedan debajo en la pila. */
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function LayoutRaiz() {
  return (
    <BibliotecaProvider>
      <NavegacionRaiz />
      <StatusBar style="dark" />
    </BibliotecaProvider>
  );
}
