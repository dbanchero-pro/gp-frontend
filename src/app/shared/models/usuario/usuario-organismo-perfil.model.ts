import { TipoPerfil } from '../../enum/tipo-perfil.enum';
import { CompraDTO } from '../compra.model';
import { ItemCompraDto } from '../item-compra.model';
import { UnidadCompraDTO } from '../sice/unidad-compra.model';

export interface UsuarioOrganismoPerfilDTO {
    id: number;
    idUsuario: string;
    nombre: string;
    perfil: TipoPerfil;
    nroDocumento: string;
    unidadCompra?: UnidadCompraDTO;
    correo: string;
    compra?: CompraDTO;
    itemCompra?: ItemCompraDto;
    tipoPerfil?: TipoPerfil;
}
