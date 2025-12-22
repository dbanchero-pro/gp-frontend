import { Pipe, PipeTransform } from '@angular/core';
import { IOrdenCompraDTO } from 'src/app/features/entregas/models/orden-ompra.model';

export type SeccionResumen =
  | 'unidad'
  | 'numero'
  | 'detalle'
  | 'compra'
  | 'proveedor'
  | 'full';

@Pipe({ name: 'ordenCompraResumen', standalone: false, pure: true })
export class OrdenCompraResumenPipe implements PipeTransform {
  transform(
    ordenCompra: Partial<IOrdenCompraDTO> | null | undefined,
    seccion: SeccionResumen = 'full'
  ): string {
    if (!ordenCompra) return '';

    const uc = ordenCompra.unidadCompra ?? {};
    const partesUnidad: string[] = [];

    if (uc.descInciso) partesUnidad.push(uc.descInciso);
    if (uc.descUnidadEjecutora) partesUnidad.push(uc.descUnidadEjecutora);
    if (uc.descUnidadCompra) partesUnidad.push('UC: ' + uc.descUnidadCompra);
    const unidadStr = partesUnidad.join(' | ');

    const clase = ordenCompra.fechaBaja ? 'class="text-danger"' : '';
    const textoAnulada = ordenCompra.fechaBaja ? '(Anulada)' : '';
    const numeroStr = ordenCompra.nroOC != null ? `Nº OC: <strong ${clase}>${ordenCompra.nroOC} ${textoAnulada}</strong>` : '';

    const compra = ordenCompra.compra;
    const tipoCompra = compra?.subtipoCompra?.descTipoCompra;
    
    const subtipoCompra = compra?.subtipoCompra?.descSubtipoCompra;
    const convenioStr = (compra?.numCompra != null && compra?.anioCompra != null)
      ? `${tipoCompra} | ${subtipoCompra} Nº ${compra.numCompra}/${compra.anioCompra}`
      : '';

    const proveedor = ordenCompra.proveedor;
    const proveedorStr = proveedor?.nombre
      ? `${proveedor.nombre} (${proveedor.paisDocumento?.descripcion ?? ''} ${proveedor.tipoDocumento ?? ''} ${proveedor.nroDocumento ?? ''})`.trim()
      : '';

    switch (seccion) {
      case 'unidad': return unidadStr;
      case 'numero': return numeroStr;
      case 'detalle': return [numeroStr].filter(Boolean).join(' ');
      case 'compra': return convenioStr;
      case 'proveedor': return proveedorStr;
      default:
        return [
          unidadStr,
          [numeroStr].filter(Boolean).join(' '),
          convenioStr,
          proveedorStr
        ].filter(Boolean).join('<br>');
    }
  }
}
