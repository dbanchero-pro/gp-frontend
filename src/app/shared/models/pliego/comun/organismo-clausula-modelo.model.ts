import { IncisoDTO } from '../../sice/inciso.model';
import { UnidadEjecutoraDTO } from '../../sice/unidad-ejecutora.model';

export interface OrganismoClausulaModeloDTO {
    inciso: IncisoDTO;
    unidadEjecutora?: UnidadEjecutoraDTO;
}
