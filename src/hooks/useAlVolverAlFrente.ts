import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/** Llama a `revisar` cada vez que la app vuelve al primer plano (por ejemplo, al volver de Ajustes). */
export function useAlVolverAlFrente(revisar: () => void): void {
  const anterior = useRef(AppState.currentState);

  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (nuevo) => {
      const estabaAfuera = anterior.current !== 'active';
      if (estabaAfuera && nuevo === 'active') {
        revisar();
      }
      anterior.current = nuevo;
    });
    return () => suscripcion.remove();
  }, [revisar]);
}
