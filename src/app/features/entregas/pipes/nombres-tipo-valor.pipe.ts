import { Pipe, PipeTransform } from '@angular/core';
import { TipoMedida } from '../enum/tipo-medida';

@Pipe({
    name: 'nombresTipoValor',
})
export class NombresTipoValorPipe implements PipeTransform {
    tiposCampos: Array<any> = [
        { nombre: 'Texto', valor: TipoMedida.STRING },
        { nombre: 'Numérico', valor: TipoMedida.NUMERO },
        { nombre: 'Fecha', valor: TipoMedida.FECHA },
        { nombre: 'Si/No', valor: TipoMedida.BOOLEANO },
    ];
    transform(value: number): string {
        const find = this.tiposCampos.find((e) => e.valor === value);
        if (find) {
            return find.nombre;
        }
        return '';
    }
}
