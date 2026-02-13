export interface PliegoBase {
  id: number;
  denominacionModelo: string;
  vigenciaModelo: string;
  estadoModelo: string; // 'BORRADOR', 'VIGENTE', etc.
  versionadaModelo: boolean;
  fechaVigenciaDesdeModelo: Date | null;
  fechaVigenciaHastaModelo: Date | null;
  incisoDescripcion: string;
  unidadEjecutoraDescripcion: string;
  tipoCompraDescripcion: string;
  subtipoCompraDescripcion: string;
  numeroCompra: number;
  anioCompra: number;
  aperturaElectronica: string; // 'SI', 'NO', 'AMBAS'
  fechaPublicacion: Date | null;
}
