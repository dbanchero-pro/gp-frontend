import { Pais } from 'src/app/shared/enum/pais.enum';
import { TipoDocumentoUsuario } from 'src/app/shared/enum/tipo-documento-usuario.enum';
import { OrdenCompraResumenPipe } from './orden-compra-resumen.pipe';

describe('OrdenCompraResumenPipe', () => {
  const pipe = new OrdenCompraResumenPipe();
  const orden: any = {
    unidadCompra: {
      descInciso: 'Inc',
      descUnidadEjecutora: 'UE',
      descUnidadCompra: 'UC'
    },
    nroOC: 1,
    nroAmpliacionOC: 2,
    compra: { numCompra: 10, anioCompra: 2020, subtipoCompra: { descSubtipoCompra: 'Subtipo', descTipoCompra: 'Tipo' } },
    proveedor: { nombre: 'Prov', paisDocumento: { descripcion: Pais.URUGUAY }, tipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD, nroDocumento: '1' }
  };

  it('crea instancia', () => {
    expect(pipe).toBeTruthy();
  });

  it('genera resumen de unidad', () => {
    expect(pipe.transform(orden, 'unidad')).toBe('Inc | UE | UC: UC');
  });

  it('genera resumen de numero', () => {
    expect(pipe.transform(orden, 'numero')).toContain('Nº OC:');
  });

  it('genera resumen de detalle', () => {
    expect(pipe.transform(orden, 'detalle')).toContain('Nº OC:');
  });

  it('genera resumen de compra', () => {
    expect(pipe.transform(orden, 'compra')).toBe('Tipo | Subtipo Nº 10/2020');
  });

  it('genera resumen de proveedor', () => {
    expect(pipe.transform(orden, 'proveedor')).toContain('Prov');
  });

  it('genera resumen completo', () => {
    const res = pipe.transform(orden, 'full');
    expect(res.includes('Inc | UE | UC')).toBeTrue();
    expect(res.includes('Nº OC:')).toBeTrue();
    expect(res.includes('Tipo | Subtipo Nº 10/2020')).toBeTrue();
    expect(res.includes('Prov')).toBeTrue();
  });
});
