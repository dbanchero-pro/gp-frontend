export interface EliminarCapituloResponse {
  exitoso: boolean;
  mensaje: string;
  tipoEliminacion: 'FISICA' | 'VERSION_EDITABLE';
}
