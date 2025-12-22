import { HttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { AuditoriaTipoABMEnum } from "src/app/shared/enum/auditoria-tipo-abm.enum";
import { RestService } from "src/app/shared/services/common/rest.service";
import { IFiltroAuditoriaUsuarioOrganismoPerfil } from "../models/filtro-auditoria-usuario-organismo-perfil.model";
import { AuditoriaUsuarioOrganismoPerfilService } from "./auditoria-usuario-organismo-perfil.service";

const mockHttpClient = {
    get: jasmine.createSpy('get').and.returnValue(of({})),
    post: jasmine.createSpy('post').and.returnValue(of({})),
    put: jasmine.createSpy('put').and.returnValue(of({})),
    delete: jasmine.createSpy('delete').and.returnValue(of({}))
};
describe("AuditoriaUsuarioOrganismoPerfilService", () => {
    let auditoriaService: AuditoriaUsuarioOrganismoPerfilService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [

            ],
            providers: [
                AuditoriaUsuarioOrganismoPerfilService,
                RestService,
                { provide: HttpClient, useValue: mockHttpClient }
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        auditoriaService = TestBed.inject(AuditoriaUsuarioOrganismoPerfilService);
    });

    it('getPageable() debería solicitar la página de auditorías', () => {
        const pageable: any = {
            pageNumber: 1,
            pageSize: 10,
            sort: "i",
            order: "asc",
        };

        let filtro: Partial<IFiltroAuditoriaUsuarioOrganismoPerfil> = {
            tipoOperacion: AuditoriaTipoABMEnum.alta,
            fechaDesde: new Date("2024-01-01"),
            fechaHasta: new Date("2024-01-31"),
            idInciso: 1
        };

        let sdaRestService: RestService = TestBed.inject(RestService);
        let spy: any = spyOn(sdaRestService, "get");

        auditoriaService.getPageable(pageable, undefined, filtro);

        expect(spy).toHaveBeenCalled();
    });

    it('obtenerParametros agrega todos los filtros', () => {
        const filtro: Partial<IFiltroAuditoriaUsuarioOrganismoPerfil> = {
            tipoOperacion: AuditoriaTipoABMEnum.alta,
            fechaDesde: new Date('2024-06-01'),
            fechaHasta: '2024-06-30',
            idInciso: 1,
            idUE: 2,
            idUC: 3,
            usuario: '10',
            perfil: 'ADMIN' as any,
            nombrePunto: 'NP',
            tipoCompra: 'TC',
            nroCompra: 4,
            anioCompra: 2024,
            nroItem: 5,
            descripcionArticulo: 'DESC'
        };

        const params = auditoriaService.obtenerParametros('7', filtro);

        expect(params.get('tipoOperacion')).toBe('ALTA');
        expect(params.get('idEntidad')).toBe('7');
        expect(params.get('fechaDesde')).toBe('2024-06-01');
        expect(params.get('fechaHasta')).toBe('2024-06-30');
        expect(params.get('idInciso')).toBe('1');
        expect(params.get('idUE')).toBe('2');
        expect(params.get('idUC')).toBe('3');
        expect(params.get('usuario')).toBe('10');
        expect(params.get('perfil')).toBe('ADMIN');
        expect(params.get('nombrePunto')).toBe('NP');
        expect(params.get('tipoCompra')).toBe('TC');
        expect(params.get('nroCompra')).toBe('4');
        expect(params.get('nroItem')).toBe('5');
        expect(params.get('descripcionArticulo')).toBe('DESC');
    });

    it('obtenerParametros maneja valores nulos', () => {
        const params = auditoriaService.obtenerParametros(undefined, {
            tipoOperacion: 'null'
        });

        expect(params.get('tipoOperacion')).toBe('');
        expect(params.get('idEntidad')).toBeNull();
        expect(params.get('nroCompra')).toBeNull();
    });
});
