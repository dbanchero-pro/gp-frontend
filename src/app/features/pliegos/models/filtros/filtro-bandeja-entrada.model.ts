import { EstadoProcesoPliego } from '../../enum/estado-proceso-pliego.enum';

export class FiltroBandejaEntradaDTO {
  constructor(
    public incisoId?: number,
    public unidadEjecutoraId?: number,
    public unidadCompraId?: number,
    public numeroCompra?: number,
    public anioCompra?: number,
    public tipoCompraId?: string,
    public estado?: EstadoProcesoPliego,
    public soloPublicadosVigentes?: boolean
  ) {}
}
