export interface EliminarClausulaResponse {
  exitoso: boolean;
  mensaje: string;
  tipoEliminacion: 'FISICA' | 'LOGICA' | 'VERSION_EDITABLE';
}
