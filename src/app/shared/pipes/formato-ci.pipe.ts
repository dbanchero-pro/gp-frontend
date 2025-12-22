import { Pipe, PipeTransform } from '@angular/core';
import { NumeroStringNulo } from '../types/numero-string-nulo.type';
import { formatearCI } from '../utils/functions';

@Pipe({ name: 'formatoCi', standalone: false })

export class FormatoCiPipe implements PipeTransform {
    transform(raw: NumeroStringNulo | undefined): string {
        return formatearCI(raw);
    }
}
