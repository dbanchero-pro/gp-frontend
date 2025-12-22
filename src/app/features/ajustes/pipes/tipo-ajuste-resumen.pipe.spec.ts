import { TipoAjusteResumenPipe } from './tipo-ajuste-resumen.pipe';
import { TipoAjuste} from '../enum/tipo-ajuste.enum';

describe('TipoAjusteResumenPipe', () => {
  let pipe: TipoAjusteResumenPipe;

  beforeEach(() => {
    pipe = new TipoAjusteResumenPipe();
  });

  it('deberia formatear el codigo de ajuste', () => {
    const valor = pipe.transform(TipoAjuste.OC_CAMBIAR_FECHA);
    expect(valor).toBe('Ajuste OC - Fecha');
  });

  it('deberia devolver el mismo texto si ya esta formateado', () => {
    const valor = pipe.transform('Ajuste OC - Punto');
    expect(valor).toBe('Ajuste OC - Punto');
  });

  it('deberia retornar el valor original cuando no se reconoce', () => {
    const valor = pipe.transform('OTRO_VALOR');
    expect(valor).toBe('OTRO_VALOR');
  });

  it('deberia retornar vacio cuando no hay informacion', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('   ')).toBe('');
  });
});
