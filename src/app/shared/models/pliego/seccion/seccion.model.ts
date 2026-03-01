import { FechaStringNulo } from '../../../types/fecha-string-nulo.type';
import { NumeroNulo } from '../../../types/numero-nulo.type';
import { EstadoElemento } from '../../../enum/estado-elemento.enum';
import { SeccionCapituloDTO } from './seccion-capitulo.model';
import { SeccionClausulaDTO } from './seccion-clausula.model';

export interface SeccionDTO {
    id: NumeroNulo;
    denominacion: string;
    capitulos: SeccionCapituloDTO[];
    clausulas: SeccionClausulaDTO[];
    fechaVigenciaDesde?: FechaStringNulo;
    fechaVigenciaHasta?: FechaStringNulo;
    estado: EstadoElemento;
    version?: number;
    fechaCreacion?: FechaStringNulo;
    usuarioCreacion?: string | null;
    fechaModificacion?: FechaStringNulo;
    usuarioModificacion?: string | null;
}
