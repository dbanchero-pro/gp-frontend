import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { UsuarioOrganismoPerfilDTO } from 'src/app/shared/models/usuario/usuario-organismo-perfil.model';

export interface UsuarioPermisoAgrupadoDTO {
    id: string;
    nombre: string | undefined;
    permisos: UsuarioOrganismoPerfilDTO[];
    permisoTodasUc?: UsuarioOrganismoPerfilDTO;
    tienePermisoTodas?: boolean; //Para identificar si tiene permiso todas, cuando modo = Filtro
    acciones?: AccionBoton[]; // Acciones a mostrar
}
