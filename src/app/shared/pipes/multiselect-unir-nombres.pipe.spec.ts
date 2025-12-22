import { TestBed } from '@angular/core/testing';
import dayjs from 'dayjs';
import { MultiSelect } from '../models/common/multiselect.model';
import { MultiselectUnirNombresPipe } from './multiselect-unir-nombres.pipe';

describe('MultiselectUnirNombresPipe', () => {
  let pipe: MultiselectUnirNombresPipe;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MultiselectUnirNombresPipe] });
    pipe = TestBed.inject(MultiselectUnirNombresPipe);
  });

  it('une los nombres como texto', () => {
    const opts: MultiSelect[] = [new MultiSelect(1, 'Uno'), new MultiSelect(2, 'Dos')];
    expect(pipe.transform(opts)).toBe('Uno, Dos');
  });

  it('formatea fechas cuando el tipo es FECHA', () => {
    const opts: MultiSelect[] = [new MultiSelect(1, '2024-06-01')];
    const result = pipe.transform(opts, 4 as any); // assume TipoMedida.FECHA = 4
    expect(result).toBe(dayjs('2024-06-01').format('DD/MM/YYYY'));
  });
});
