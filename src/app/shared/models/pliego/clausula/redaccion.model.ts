import { FechaStringNulo } from 'src/app/shared/types/fecha-string-nulo.type';
import { NumeroNulo } from 'src/app/shared/types/numero-nulo.type';
import { ClausulaDTO } from './clausula.model';

export interface RedaccionDTO {
    id?: NumeroNulo;
    clausula?: ClausulaDTO;
    prioridad: number;
    redaccion: string;
    fechaCreacion?: FechaStringNulo;
    usuarioCreacion?: string | null;
    fechaModificacion?: FechaStringNulo;
    usuarioModificacion?: string | null;
}
