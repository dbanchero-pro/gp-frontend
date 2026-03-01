import { CapituloDTO } from 'src/app/shared/models/pliego/capitulo/capitulo.model';
import { SeccionDTO } from 'src/app/shared/models/pliego/seccion/seccion.model';
import { ClausulaPliego } from './clausula-pliego.model';

export interface CapituloPliegoDTO {
    nombre: string;
    expandido: boolean;
    clausulas: ClausulaPliego[];
    capitulo: CapituloDTO;
}

export interface SeccionPliegoDTO {
    nombre: string;
    expandida: boolean;
    capitulos: CapituloPliegoDTO[];
    clausulas: ClausulaPliego[];
    seccion: SeccionDTO;
    soloClausulas: boolean;
}
