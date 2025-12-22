/* tslint:disable:no-unused-variable */

import { Pais } from '../enum/pais.enum';
import { ProveedorPipe } from './proveedor.pipe';

describe('Pipe: Proveedore', () => {
  it('debería crear una instancia', () => {
    let pipe = new ProveedorPipe();
    expect(pipe).toBeTruthy();
  });

  it('debe retornar la descripcion completa del proveedor', () => {
    const pipe = new ProveedorPipe();
    const prov: any = {
      nombre: 'Juan',
      paisDocumento: { descripcion: Pais.URUGUAY },
      tipoDocumento: 'RUT',
      nroDocumento: '123'
    };
    expect(pipe.transform(prov)).toBe('Juan (RUT 123 UY)');
  });

  it('debe manejar valores undefined', () => {
    const pipe = new ProveedorPipe();
    const prov: any = {
      nombre: undefined,
      paisDocumento: undefined,
      tipoDocumento: undefined,
      nroDocumento: undefined
    };
    expect(pipe.transform(prov)).toBe(' (  )');
  });

  it('debe devolver una cadena vacia si no hay proveedor', () => {
    const pipe = new ProveedorPipe();
    expect(pipe.transform(undefined)).toBe('');
  });
});
