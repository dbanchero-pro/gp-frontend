import { EstadoProcesoPliego } from '../enum/estado-proceso-pliego.enum';

export interface ProcesoPliego {
  id: number;
  estado: EstadoProcesoPliego;
  incisoDescripcion: string;
  unidadEjecutoraDescripcion: string;
  unidadCompraDescripcion: string;
  tipoCompraDescripcion: string;
  subtipoCompraDescripcion: string;
  numeroCompra: number;
  anioCompra: number;
  fechaPublicacion?: Date;
  fechaTopeRecepcionOfertas?: Date;
  vigente?: boolean;
}
