
import { Pipe, PipeTransform } from '@angular/core';
import { TipoAjuste, obtenerNombreTipo } from '../enum/tipo-ajuste.enum';

@Pipe({
    name: 'tipoAjusteResumen',
    standalone: false
})
export class TipoAjusteResumenPipe implements PipeTransform {
    transform(valor: TipoAjuste | string | null | undefined): string {
        if (valor === null || valor === undefined) {
            return '';
        }

        const texto = String(valor).trim();
        if (!texto) {
            return '';
        }

        const nombre = obtenerNombreTipo(texto as TipoAjuste);
        return nombre || texto;
    }
}