import { TipoPerfil } from 'src/app/shared/enum/tipo-perfil.enum';

export interface IConsultaUsuarioOrganismoPerfilFiltroDTO {
    tipoCompra?: string;
    idInciso?: number;
    idUnidadEjecutora?: number;
    idUnidadCompra?: number;
    numCompra?: string;
    anioCompra?: number;
    nroItem?: number;
    nomEntregable?: string;
    codEntregable?: string;
    nroDocumento?: string;
    tipoPerfil: TipoPerfil;
    descripcionArticulo?: string;
    permisoTodas?: boolean;
    idZona?: number;
    departamento?: string;
    nombrePuntoRecepcion?: string;
}
