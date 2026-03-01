import { NumeroNulo } from 'src/app/shared/types/numero-nulo.type';
import { CapituloDTO } from '../capitulo/capitulo.model';

export interface SeccionCapituloDTO {
    id: NumeroNulo;
    capitulo: CapituloDTO;
    orden: number;
}
