import { Boton } from '@/components/boton';
import { Cargando } from '@/components/cargando';
import { MensajeEstado } from '@/components/mensaje-estado';
import type { NombreIcono } from '@/types';

type Props = {
  cargando: boolean;
  textoCargando: string;
  error: string | null;
  onReintentar: () => void;
  vacio: { icono: NombreIcono; titulo: string; texto?: string };
};

/** Lo que muestra una lista sin elementos: cargando, error con "Reintentar" o vacía. */
export function EstadoLista({ cargando, textoCargando, error, onReintentar, vacio }: Props) {
  if (cargando) {
    return <Cargando texto={textoCargando} />;
  }
  if (error) {
    return (
      <MensajeEstado icono="cloud-offline" titulo="Algo salió mal" texto={error}>
        <Boton titulo="Reintentar" icono="refresh" onPress={onReintentar} />
      </MensajeEstado>
    );
  }
  return <MensajeEstado icono={vacio.icono} titulo={vacio.titulo} texto={vacio.texto} />;
}
