import { IPuntoRecepcionDTO } from 'src/app/features/administracion/puntos-recepcion/models/punto-recepcion.model';
import { IItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { IOrdenCompraDTO } from 'src/app/features/entregas/models/orden-ompra.model';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { IArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { UsuarioDTO } from 'src/app/shared/models/usuario/usuario.model';
import { IDescargoDTO } from '../../entregas/models/descargo.model';
import { EstadoAjuste } from '../enum/estado-ajuste.enum';
import { TipoAjuste } from '../enum/tipo-ajuste.enum';

export interface IAjusteDTO {
    idAjuste?: number;
    tipoAjuste?: TipoAjuste;
    estado?: EstadoAjuste;
    fechaSolicitud?: string;
    fechaResolucion?: string;
    tipoSolicitante?: TipoUsuario;
    usuarioSolicitante?: UsuarioDTO | null;
    ordenCompra?: IOrdenCompraDTO | null;
    itemOrdenCompra?: IItemOrdenCompraDTO | null;
    puntoRecepcionOriginal?: IPuntoRecepcionDTO | null;
    puntoRecepcionNuevo?: IPuntoRecepcionDTO | null;
    fechaOriginal?: string | null;
    fechaNueva?: string | null;
    cantidadOriginal?: number | null;
    cantidadNueva?: number | null;
    archivo?: IArchivoDTO | null;
    comentario?: string | null;
    permitidoEnPliego?: boolean | null;
    fuerzaMayor?: boolean | null;
    motivoResolucion?: string | null;
    descargos?: IDescargoDTO[] | null;
    mensajeError?: string | null;
}
