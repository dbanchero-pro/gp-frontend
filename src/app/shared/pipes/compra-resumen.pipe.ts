import { Pipe, PipeTransform } from '@angular/core';
import { CompraDTO } from 'src/app/shared/models/compra.model';

type SeccionResumen = 'unidad' | 'detalle' | 'detalleHtml' | 'full';

@Pipe({
    standalone: true,
    name: 'compraResumen',
})
export class CompraResumenPipe implements PipeTransform {
    transform(
        compra: Partial<CompraDTO> | null | undefined,
        seccion: SeccionResumen = 'full',
    ): string {
        if (!compra) return '';

        // Unidad
        const uc = compra.unidadCompra ?? {};
        const partesUnidad: string[] = [];
        const ua = !!compra.grupo?.idGrupo;
        const unidadLabel = ua ? 'UA: ' : 'UC: ';

        if (uc.descInciso) partesUnidad.push(uc.descInciso);
        if (uc.descUnidadEjecutora) partesUnidad.push(uc.descUnidadEjecutora);
        if (uc.descUnidadCompra)
            partesUnidad.push(`${unidadLabel}${uc.descUnidadCompra}`);

        const unidadStr = partesUnidad.join(' | ');

        // Detalle
        const tipoCompra = compra.subtipoCompra?.descTipoCompra;
        const subtipoCompra = compra.subtipoCompra?.descSubtipoCompra;
        const numCompra = compra.numCompra;
        const anioCompra = compra.anioCompra;
        const nroAmpliacion = compra.nroAmpliacion;

        const convenio =
            tipoCompra && numCompra != null && anioCompra != null
                ? `${tipoCompra} Nº ${numCompra}/${anioCompra}`
                : '';

        const convenioHtml =
            tipoCompra && numCompra != null && anioCompra != null
                ? `<strong>${tipoCompra} | ${subtipoCompra} Nº ${numCompra}/${anioCompra}</strong>`
                : '';

        const ampliacion =
            nroAmpliacion != null && nroAmpliacion !== 0
                ? `Nº ampliación/renovación: ${nroAmpliacion}`
                : '';

        const ampliacionHtml =
            nroAmpliacion != null && nroAmpliacion !== 0
                ? `Nº ampliación/renovación: <strong>${nroAmpliacion}</strong>`
                : '';

        const detalleStr = [convenio, ampliacion].filter(Boolean).join(' | ');
        const detalleHtml = [convenioHtml, ampliacionHtml]
            .filter(Boolean)
            .join(' | ');

        // Resultado según sección
        switch (seccion) {
            case 'unidad':
                return unidadStr;
            case 'detalle':
                return detalleStr; // texto plano
            case 'detalleHtml':
                return detalleHtml; // con <strong>
            case 'full':
            default:
                return [unidadStr, detalleHtml].filter(Boolean).join('<br>'); // full con HTML
        }
    }
}
