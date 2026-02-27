import { NumeroNulo } from "../../../types/numero-nulo.type";
import { SeccionDTO } from "../seccion/seccion.model";


export interface ModeloSeccionDTO {
  id: NumeroNulo;
  seccion: SeccionDTO;
  orden: number;
}
