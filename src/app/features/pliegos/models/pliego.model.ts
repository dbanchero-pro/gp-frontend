
import { ModeloDTO } from "src/app/shared/models/pliego/modelo/modelo.model";
import { SubtipoCompraDTO } from "src/app/shared/models/sice/subtipo-compra.model";
import { UnidadEjecutoraDTO } from "src/app/shared/models/sice/unidad-ejecutora.model";
import { NumeroNulo } from "src/app/shared/types/numero-nulo.type";
import { NotaDTO } from "./nota.model";
import { CampoPliegoDTO } from "./campo-pliego.model";
import { EstadoPliego } from "../enum/estado-pliego.enum";
import { SiNoAmbasValor } from "src/app/shared/enum/si-no-ambas-valor.enum";
import { UsuarioAsignadoPliegoDTO } from "./usuario-asignado-pliego.model";
import { TareaHistorialDTO } from "./tarea-historial.model";

export interface PliegoDTO {
  id: number;
  modelo: ModeloDTO;
  notas: NotaDTO [];
  estado: EstadoPliego; 
  unidadEjecutora: UnidadEjecutoraDTO;
  subtipoCompra: SubtipoCompraDTO;
  numeroCompra: number;
  anioCompra: number;
  aperturaElectronica: SiNoAmbasValor;
  fechaPublicacion?: Date;
  fechaTopeRecepcionOfertas?: Date;
  version: NumeroNulo;
  campos: CampoPliegoDTO;
  usuariosAsignados?: UsuarioAsignadoPliegoDTO[];
  historial: TareaHistorialDTO[];
}
