import { UsuarioOrganismoDTO } from "src/app/shared/models/usuario/usuario-organismo.model";
import { IPuntoRecepcionDTO } from "./punto-recepcion.model";

export interface IFuncionarioPuntoRecepcionDTO {
    puntoRecepcion: IPuntoRecepcionDTO;
    usuarioOrganismo: UsuarioOrganismoDTO;
    fechaBaja?: Date;
}
