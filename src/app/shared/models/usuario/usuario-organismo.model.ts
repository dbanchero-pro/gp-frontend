import { IPaisDTO } from '../common/pais.model';
import { UnidadCompraDTO } from '../sice/unidad-compra.model';
import { TipoDocumentoUsuarioDTO } from './tipo-documento-usuario.model';

export interface UsuarioOrganismoDTO {
    id: string;
    nombre: string;
    pais: IPaisDTO;
    tipoDocumento: TipoDocumentoUsuarioDTO;
    nroDocumento: string;
    unidadCompra: UnidadCompraDTO;
    correo: string;
}
