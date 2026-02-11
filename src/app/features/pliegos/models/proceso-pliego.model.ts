import { EstadoProcesoPliego } from '../enum/estado-proceso-pliego.enum';
import { UsuarioAsignado } from '../components/bandeja-entrada/asignar-usuarios/models/usuario-asignado.model';

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
  usuariosAsignados?: UsuarioAsignado[];
}
