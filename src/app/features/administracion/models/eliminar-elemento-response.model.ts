export interface EliminarElementoResponseDTO {
  exitoso: boolean;
  mensaje: string;
  tipoEliminacion?: 'FISICA' | 'LOGICA' | 'VERSION_EDITABLE';
}
