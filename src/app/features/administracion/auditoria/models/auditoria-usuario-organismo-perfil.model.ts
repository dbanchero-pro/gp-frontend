import { AuditoriaTipoABMEnum } from 'src/app/shared/enum/auditoria-tipo-abm.enum';
import { TipoPerfil } from 'src/app/shared/enum/tipo-perfil.enum';
import { CompraDTO } from 'src/app/shared/models/compra.model';
import { ItemCompraDto } from 'src/app/shared/models/item-compra.model';
import { UnidadCompraDTO } from 'src/app/shared/models/sice/unidad-compra.model';
import { IPuntoRecepcionDTO } from '../../puntos-recepcion/models/punto-recepcion.model';

export interface IAuditoriaUsuarioOrganismoPerfilDTO {
    idEntidad: number;
    fechaOperacion: string;
    tipoOperacion: AuditoriaTipoABMEnum;
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
    puntoRecepcion?: IPuntoRecepcionDTO
    usuario: string;
}
