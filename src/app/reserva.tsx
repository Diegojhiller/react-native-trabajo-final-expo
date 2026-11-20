import { Redirect } from 'expo-router';

/** URL vieja de la versión anterior: redirige (reemplazando, sin dejar historial) a /reservas. */
export default function RutaViejaReserva() {
  return <Redirect href="/reservas" />;
}
