export interface PliegoBase {
  id: number;
  denominacionModelo: string;
  vigenciaModelo: string;
  incisoDescripcion: string;
  unidadEjecutoraDescripcion: string;
  tipoCompraDescripcion: string;
  subtipoCompraDescripcion: string;
  numeroCompra: number;
  anioCompra: number;
  aperturaElectronica: string; // 'SI', 'NO', 'AMBAS'
  fechaPublicacion: Date | null;
}
