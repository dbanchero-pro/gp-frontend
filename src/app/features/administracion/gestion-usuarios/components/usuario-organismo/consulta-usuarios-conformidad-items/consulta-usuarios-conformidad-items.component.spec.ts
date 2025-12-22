import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    fakeAsync,
    tick,
} from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, of } from 'rxjs';

import {
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TipoBusqueda } from 'src/app/shared/enum/tipo-busqueda-item.enum';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { CompraSiceService } from 'src/app/shared/services/compra-sice.service';
import { UsuarioOrganismoPerfilService } from 'src/app/shared/services/usuario/usuario-perfil.service';
import { UsuarioService } from 'src/app/shared/services/usuario/usuario.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { ConsultaUsuariosConformidadItemsComponent } from './consulta-usuarios-conformidad-items.component';

class ModalServiceStub {
    show = jasmine.createSpy('show').and.callFake(() => {
        const ref = new BsModalRef();
        ref.content = {};
        return ref;
    });
}

function createParamMap(obj: Record<string, any>): ParamMap {
    return {
        has: (name: string) => obj[name] !== undefined,
        get: (name: string) =>
            obj[name] !== undefined ? String(obj[name]) : null,
        getAll: () => [],
        keys: Object.keys(obj),
    } as unknown as ParamMap;
}

describe('ConsultaUsuariosConformidadItemsComponent', () => {
    let component: ConsultaUsuariosConformidadItemsComponent;
    let fixture: ComponentFixture<ConsultaUsuariosConformidadItemsComponent>;

    const actualizarSpy = jasmine.createSpyObj('ActualizarService', [
        'confirmar',
        'mensajeCorrecto',
    ]);
    const usuarioSrvSpy = jasmine.createSpyObj('UsuarioService', [
        'obtenerUsuarioPorId',
    ]);
    const compraSiceSpy = jasmine.createSpyObj('CompraSiceService', [
        'obtenerCompraPorId',
        'obtenerListaItemsCompra',
    ]);
    const usuarioPerfilSpy = jasmine.createSpyObj(
        'UsuarioOrganismoPerfilService',
        ['agregarConformidadPorItem']
    );

    const paramSubject = new BehaviorSubject<ParamMap>(createParamMap({}));
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, SharedModule, RouterTestingModule],
            declarations: [ConsultaUsuariosConformidadItemsComponent],
            providers: [
                FormBuilder,
                {
                    provide: ActivatedRoute,
                    useValue: { paramMap: paramSubject.asObservable() },
                },
                { provide: ActualizarService, useValue: actualizarSpy },
                { provide: UsuarioService, useValue: usuarioSrvSpy },
                { provide: CompraSiceService, useValue: compraSiceSpy },
                {
                    provide: UsuarioOrganismoPerfilService,
                    useValue: usuarioPerfilSpy,
                },
                { provide: BsModalService, useClass: ModalServiceStub },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(
            ConsultaUsuariosConformidadItemsComponent
        );
        component = fixture.componentInstance;
    });

    it('debería crearse y tener el formulario inicializado', () => {
        expect(component).toBeTruthy();
        expect(component.form.value).toEqual({
            tipoCompra: '',
            nroAnioCompra: '',
        });
    });
    it('ngOnInit debe llamar a obtenerCompra si viene idCompra por parámetro', () => {
        compraSiceSpy.obtenerCompraPorId.and.returnValue(
            of({ idCompra: 99 } as any)
        );
        paramSubject.next(createParamMap({ idCompra: '99' }));

        compraSiceSpy.obtenerCompraPorId.calls.reset();

        component.ngOnInit();

        expect(compraSiceSpy.obtenerCompraPorId).toHaveBeenCalledOnceWith(99);
        expect(component.compra?.idCompra).toBe(99);
    });
    it('ngOnInit debe llamar a obtenerUsuarioPorId si viene idUsuario por parámetro', () => {
        usuarioSrvSpy.obtenerUsuarioPorId.and.returnValue(
            of({ id: 'u-1', nombre: 'Foo' } as any)
        );
        paramSubject.next(createParamMap({ idUsuario: 'u-1' }));

        usuarioSrvSpy.obtenerUsuarioPorId.calls.reset();

        component.ngOnInit();

        expect(usuarioSrvSpy.obtenerUsuarioPorId).toHaveBeenCalledWith('u-1');
        expect(component.usuario.id).toBe('u-1');
    });

    it('onFiltroItemsCambio debe fijar nroItem y descripcionArticulo correctamente', () => {
        component.parametros = { filtro: {} } as any;
        component.onFiltroItemsCambio({
            tipoBusqueda: TipoBusqueda.NROITEM,
            item: '123',
        } as any);
        expect(component.filtroItem.item).toBe('123');
        component.onFiltroItemsCambio({
            tipoBusqueda: TipoBusqueda.ARTICULO,
            item: 'tornillo',
        } as any);
        expect(component.filtroItem.item).toBe('tornillo'
        );
    });
    it('buscarInicial debe construir parámetros y rellenar items/total', fakeAsync(() => {
        component.parametros = {
            pagina: 3,
            tamanoPagina: 20,
            sort: 'nroItem',
            order: 'desc',
            filtro: {
                nroItem: 11,
                idCompra: 42,
                idUsuario: 'user-7',
            },
        } as any;
        component.compra = { idCompra: 42 } as any;
        component.usuario = { id: 'user-7' } as any;
        const respuestaBackend = {
            content: [{ idItem: 1 }, { idItem: 2 }],
            page: { totalElements: 999 },
        };
        compraSiceSpy.obtenerListaItemsCompra.and.returnValue(of(respuestaBackend.content));
        component.buscarInicial();
        tick();
        expect(compraSiceSpy.obtenerListaItemsCompra).toHaveBeenCalled();
         expect(component.total).toBe(2);
    }));

    it('buscar debe construir parámetros y rellenar items/total', fakeAsync(() => {
        component.parametros = {
            pagina: 3,
            tamanoPagina: 20,
            sort: 'nroItem',
            order: 'desc',
            filtro: {
                nroItem: 11,
                idCompra: 42,
                idUsuario: 'user-7',
            },
        } as any;
        component.compra = { idCompra: 42 } as any;
        component.usuario = { id: 'user-7' } as any;

        component.todos =[{ idItem: 1, idCompra: 1 }, { idItem: 2, idCompra: 1 }];
        component.buscar();
        tick();
        expect(component.total).toBe(2);
    }));


    it('nuevaConsulta debe limpiar filtros, items y resetear página', () => {
        component.filtroItemsComponent = {
            limpiar: jasmine.createSpy('limpiar'),
        };
        component.parametros = { pagina: 5, filtro: {} } as any;
        component.items = [{ nroItem: '1' }] as any;
        component.todos = [{ nroItem: '1' }] as any;
        component.total = 10;
        component.nuevaConsulta();
        expect(component.filtroItemsComponent.limpiar).toHaveBeenCalled();
        expect(component.parametros.pagina).toBe(0);
        expect(component.items.length).toBe(0);
        expect(component.total).toBe(1);
        expect(component.form.pristine).toBeTrue();
    });

    it('agregarPermisoPorItem debe pedir confirmación y luego llamar al servicio de perfil', () => {
        component.compra = { idCompra: 7 } as any;
        component.usuario = { id: 'user-7' } as any;
        const fakeItem = { idItem: 9 } as any;
        let callback!: () => void;
        actualizarSpy.confirmar.and.callFake((_msg: string, cb: () => void) => {
            callback = cb;
        });
        usuarioPerfilSpy.agregarConformidadPorItem.and.returnValue(of({}));
        component.agregarPermisoPorItem(fakeItem);
        callback();
        expect(
            usuarioPerfilSpy.agregarConformidadPorItem
        ).toHaveBeenCalledOnceWith(7, 9, 'user-7');
        expect(actualizarSpy.mensajeCorrecto).toHaveBeenCalled();
    });

    it('limpiarFiltroItems debe poner los filtros en undefined', () => {
        component.parametros = {
            filtro: { nroItem: 1, descripcionArticulo: 'abc' },
        } as any;
        component.limpiarFiltroItems();
        expect(component.parametros.filtro.nroItem).toBeUndefined();
        expect(component.parametros.filtro.descripcionArticulo).toBeUndefined();
    });
});
