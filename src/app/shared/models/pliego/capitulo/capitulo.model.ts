import { FechaStringNulo } from '../../../../shared/types/fecha-string-nulo.type';
import { NumeroNulo } from '../../../../shared/types/numero-nulo.type';
import { EstadoElemento } from '../../../enum/estado-elemento.enum';
import { CapituloClausulaDTO } from './capitulo-clausula.model';

export interface CapituloDTO {
    id: NumeroNulo;
    denominacion: string;
    clausulas: CapituloClausulaDTO[];
    fechaVigenciaDesde?: FechaStringNulo;
    fechaVigenciaHasta?: FechaStringNulo;
    estado: EstadoElemento;
    version?: number;
    fechaCreacion?: FechaStringNulo;
    usuarioCreacion?: string | null;
    fechaModificacion?: FechaStringNulo;
    usuarioModificacion?: string | null;
}
