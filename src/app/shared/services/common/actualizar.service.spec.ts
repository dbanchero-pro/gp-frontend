import { TipoMensajeEnum } from '../../enum/tipo-mensaje.enum';
import { ActualizarService } from './actualizar.service';

describe('ActualizarService', () => {
    let service: ActualizarService;

    beforeEach(() => {
        service = new ActualizarService();
    });

    it('mensajeCorrecto emite mensaje success', (done) => {
        service.mensaje$.subscribe((val) => {
            if (val.length) {
                expect(val[0]).toEqual(['ok']);
                expect(val[1]).toBe(TipoMensajeEnum.success);
                done();
            }
        });
        service.mensajeCorrecto('ok');
    });

    it('guardarMensajeTemporal y emitirMensajeTemporalSiExiste funcionan', () => {
        service.guardarMensajeTemporal('hola', TipoMensajeEnum.warn);
        service.emitirMensajeTemporalSiExiste();
        expect(service.mensaje$.value).toEqual([
            ['hola'],
            TipoMensajeEnum.warn,
        ]);
    });

    it('confirmar emite pregunta como arreglo', () => {
        service.confirmar(
            '¿Seguro?',
            () => {},
            () => {},
        );
        expect(service.confirmar$.value[0]).toEqual(['¿Seguro?']);
    });

    it('confirmar acepta arreglos', () => {
        service.confirmar(
            ['a', 'b'],
            () => {},
            () => {},
        );
        expect(service.confirmar$.value[0]).toEqual(['a', 'b']);
    });

    it('confirmar usa funcionCancelar por defecto', () => {
        service.confirmar('x', () => {});
        expect(service.confirmar$.value[0]).toEqual(['x']);
        (service.confirmar$.value[2] as Function)();
    });

    it('mensajeError maneja string y arreglo', () => {
        service.mensajeError('e1');
        expect(service.mensaje$.value).toEqual([['e1'], TipoMensajeEnum.error]);
        service.mensajeError(['e2']);
        expect(service.mensaje$.value).toEqual([['e2'], TipoMensajeEnum.error]);
    });

    it('showMsgError muestra u oculta según bandera', () => {
        const fn = jasmine.createSpy();
        service.showMsgError('err', true, fn);
        expect(service.mensaje$.value[1]).toBe(TipoMensajeEnum.error);
        service.showMsgError('err', false, fn);
        expect(service.mensaje$.value).toEqual([true]);
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('otros mensajes y guardar por defecto', () => {
        service.mensajeAdvertencia('a');
        expect(service.mensaje$.value).toEqual([['a'], TipoMensajeEnum.warn]);
        service.mensajeInformacion('i');
        expect(service.mensaje$.value).toEqual([['i'], TipoMensajeEnum.info]);
        service.mensajeModal('t', 'm');
        expect(service.alerta$.value).toEqual(['t', 'm']);
        service.mensajeModalTextoAdicional('t', 'm', 'x');
        expect(service.alerta$.value).toEqual(['t', 'm', 'x']);
        service.guardarMensajeTemporal('ok');
        expect((service as any).mensajeTemporal[1]).toBe(
            TipoMensajeEnum.success,
        );
        service.emitirMensajeTemporalSiExiste();
        expect(service.mensaje$.value).toEqual([
            ['ok'],
            TipoMensajeEnum.success,
        ]);
        service.emitirMensajeTemporalSiExiste();
        expect((service as any).mensajeTemporal).toBeNull();
        service.guardarMensajeTemporal(['z'], TipoMensajeEnum.warn);
        expect((service as any).mensajeTemporal[0]).toEqual(['z']);
    });
});
