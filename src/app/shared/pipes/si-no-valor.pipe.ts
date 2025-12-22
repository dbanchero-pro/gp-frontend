import { Pipe, PipeTransform } from '@angular/core';
import { SiNoValor } from '../enum/si-no-valor.enum';

@Pipe({ name: 'siNoValor', standalone: false})
export class SiNoValorPipe implements PipeTransform {
    opcionesRequerido: any = [
        { id: SiNoValor.SI, nombre: 'Si' },
        { id: SiNoValor.NO, nombre: 'No' },
    ];
    transform(value: string | undefined): string {
        const find = this.opcionesRequerido.find((e: any) => e.id === value);
        if (find) {
            return find.nombre;
        }
        return '';
    }
}
