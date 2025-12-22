import { FormControl } from '@angular/forms';
import { requiredFileType } from './required-file-type.validator';

describe('requiredFileType Validator', () => {
  it('debe retornar null para un tipo de archivo válido', () => {
    const control = new FormControl('file.txt');
    const validator = requiredFileType('txt');

    const result = validator(control);

    expect(result).toBeNull();
  });

  it('debe retornar null para múltiples tipos válidos', () => {
    const control = new FormControl(undefined);
    const validator = requiredFileType('pdf,doc');

    const result = validator(control);

    expect(result).toBeNull();
  });

  it('debe retornar error para un tipo de archivo inválido', () => {
    const control = new FormControl('file.png');
    const validator = requiredFileType('pdf,doc');

    const result = validator(control);

    expect(result).toEqual({ requiredFileType: true });
  });

  it('debe retornar error si el tipo no está en la lista', () => {
    const control = new FormControl('file.txt');
    const validator = requiredFileType('pdf,doc');

    const result = validator(control);

    expect(result).toEqual({ requiredFileType: true });
  });

  it('debe retornar null si el control está vacío', () => {
    const control = new FormControl('');
    const validator = requiredFileType('pdf,doc');

    const result = validator(control);

    expect(result).toBeNull();
  });
});
