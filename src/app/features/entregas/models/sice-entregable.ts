import { TipoOperacion } from "../enum/tipo-operacion.enum";

export interface ISiceEntregableDTO {
  tipoOperacion?: TipoOperacion;
  codEntregable?: string;
  descEntregable?: string;
  plazoEntrega?: number;
  fechaComprometida?: Date;
  cantidad?: number;
}

export class SiceEntregableDTO implements ISiceEntregableDTO {
  constructor(
    public tipoOperacion?: TipoOperacion,
    public codEntregable?: string,
    public descEntregable?: string,
    public plazoEntrega?: number,
    public fechaComprometida?: Date,
    public cantidad?: number,
  ) {}
}
