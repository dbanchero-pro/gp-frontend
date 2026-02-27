import { ArticuloServObraDTO } from "../../cbso/articulo-serv-obra.model";
import { ClaseDTO } from "../../cbso/clase.model";
import { FamiliaDTO } from "../../cbso/familia.model";
import { SubclaseDTO } from "../../cbso/subclase.model";
import { SubfamiliaDTO } from "../../cbso/subfamilia.model";

export interface ObjetoCompraDTO {
  familia: FamiliaDTO;
  subfamilia?: SubfamiliaDTO;
  clase?: ClaseDTO;
  subclase?: SubclaseDTO;
  articulo?: ArticuloServObraDTO;
}