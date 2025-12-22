import { IArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { TipoDescargo } from '../enum/tipo-descargo.enum';

export interface IDescargoDTO {
  id?: number;
  idEntrega?: number;
  idAjuste?: number;
  archivo?: IArchivoDTO;
  comentario?: string;
  tipo?: TipoDescargo;
}
