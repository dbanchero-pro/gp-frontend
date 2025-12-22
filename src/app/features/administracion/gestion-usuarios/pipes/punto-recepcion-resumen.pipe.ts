import { Pipe, PipeTransform } from '@angular/core';
import { IPuntoRecepcionDTO } from '../../puntos-recepcion/models/punto-recepcion.model';
@Pipe({
    name: 'puntoRecepcionResumen',
    standalone: false
})
export class PuntoRecepcionResumenPipe implements PipeTransform {

    transform(punto: IPuntoRecepcionDTO | null | undefined): string {
        if (!punto) {
            return '';
        }

        const partes = [
            punto.nombre,
            punto.zona?.descripcionZona
        ].filter(Boolean);

        return partes.join(' | ');
    }
}
