import { ClausulaDTO } from '../clausula/clausula.model';

export interface CapituloClausulaDTO {
    Id: number;
    orden: number;
    clausula: ClausulaDTO;
}
