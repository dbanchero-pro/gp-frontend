import { IAjusteDTO } from './ajuste.model';

export interface IAjustesItemsResponseDTO {
  ajustesProcesados?: IAjusteDTO[] | null;
  ajustesConError?: IAjusteDTO[] | null;
  listaMensajes?: string[] | null;
}
