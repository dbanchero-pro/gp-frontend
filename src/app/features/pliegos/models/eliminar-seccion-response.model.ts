export interface EliminarSeccionResponse {
  exitoso: boolean;
  mensaje: string;
  tipoEliminacion: 'FISICA' | 'VERSION_EDITABLE';
}
