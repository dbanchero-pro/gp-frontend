import { esTipoDeItem, esTipoDeOC, obtenerNombreTipo, obtenerTiposParaItem, obtenerTiposParaOC, TipoAjuste, TIPOS_AJUSTE } from './tipo-ajuste.enum';

describe('tipo-ajuste enum', () => {
  it('debe exponer todos los tipos para OC', () => {
    const tipos = obtenerTiposParaOC();
    expect(tipos.map(t => t.tipo)).toEqual([
      TipoAjuste.OC_CAMBIAR_FECHA,
      TipoAjuste.OC_CAMBIAR_PR,
      TipoAjuste.OC_ANULAR
    ]);
    expect(tipos.every(t => t.esParaOC && !t.esParaItem)).toBeTrue();
  });

  it('debe exponer todos los tipos para Item', () => {
    const tipos = obtenerTiposParaItem();
    expect(tipos.map(t => t.tipo)).toEqual([
      TipoAjuste.ITEM_ANULAR,
      TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD,
      TipoAjuste.ITEM_CAMBIAR_CANTIDAD,
      TipoAjuste.ITEM_CAMBIAR_FECHA
    ]);
    expect(tipos.every(t => t.esParaItem && !t.esParaOC)).toBeTrue();
  });

  it('obtenerNombreTipo devuelve el nombre y vacío cuando no existe', () => {
    const info = TIPOS_AJUSTE[0];
    expect(obtenerNombreTipo(info.tipo)).toBe(info.nombre);
    expect(obtenerNombreTipo('DESCONOCIDO' as TipoAjuste)).toBe('');
  });

  it('esTipoDeOC y esTipoDeItem discriminan correctamente', () => {
    expect(esTipoDeOC(TipoAjuste.OC_ANULAR)).toBeTrue();
    expect(esTipoDeOC(TipoAjuste.ITEM_ANULAR)).toBeFalse();
    expect(esTipoDeItem(TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD)).toBeTrue();
    expect(esTipoDeItem(TipoAjuste.OC_CAMBIAR_PR)).toBeFalse();
  });
});
