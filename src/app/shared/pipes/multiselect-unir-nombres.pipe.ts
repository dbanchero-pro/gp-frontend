import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';
import { TipoMedida } from 'src/app/features/entregas/enum/tipo-medida';
import { MultiSelect } from '../models/common/multiselect.model';

@Pipe({
    name: 'multiselectUnirNombres',
})
export class MultiselectUnirNombresPipe implements PipeTransform {
    transform(
        opcionesSeleccionadas: MultiSelect[],
        tipo: TipoMedida = TipoMedida.STRING
    ): string {
        // Obtener los nombres de las opciones seleccionadas
        const nombresSeleccionados: string[] = opcionesSeleccionadas.map(
            (opcion) =>
                tipo === TipoMedida.FECHA
                    ? dayjs(opcion.nombre).format('DD/MM/YYYY')
                    : opcion.nombre
        );
        // Realizar el join de los nombres
        const nombresUnidos: string = nombresSeleccionados.join(', ');
        return nombresUnidos;
    }
}
