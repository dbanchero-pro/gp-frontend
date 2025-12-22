import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { CompraDTO } from '../../models/compra.model';
import { SubtipoCompraDTO } from '../../models/sice/subtipo-compra.model';
import { TipoCompraDTO } from '../../models/sice/tipo-compra.model';
import { GeneralService } from './general.service';
import { RestService } from './rest.service';

class MockgcRestService {
    get<T>(url: string): Observable<T> {
        return of([] as T);
    }
}

describe('GeneralService', () => {
    let service: GeneralService;
    let gcRestService: MockgcRestService;
    let locationSpy: jasmine.SpyObj<Location>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GeneralService,
                { provide: RestService, useClass: MockgcRestService }
            ],
        });

        service = TestBed.inject(GeneralService);
        gcRestService = TestBed.inject(RestService) as MockgcRestService;
    });

    it('debería crearse', () => {
        expect(service).toBeTruthy();
    });

    it('debería obtener tipos de compras', () => {
        const tiposCompraMock: TipoCompraDTO[] = [
            { id: '1', descTipoCompra: 'Tipo1' },
        ];
        spyOn(gcRestService, 'get').and.returnValue(of(tiposCompraMock));

        service.getTiposCompra().subscribe((tiposCompra) => {
            expect(tiposCompra).toEqual(tiposCompraMock);
        });

        expect(gcRestService.get).toHaveBeenCalledWith(
            '/api/restricciones/v1/tipos-compras/todos'
        );
    });

    it('debería obtener subtipos de compras por tipo de compra', () => {
        const idTipoCompra = '1';
        const subtiposCompraMock: SubtipoCompraDTO[] = [
            {
                idSubtipoCompra: '1',
                descSubtipoCompra: 'Subtipo1',
                idTipoCompra: '1',
                descTipoCompra: 'Tipo1',
            },
        ];
        spyOn(gcRestService, 'get').and.returnValue(of(subtiposCompraMock));

        service
            .getSubTiposCompraPorTipoCompra(idTipoCompra)
            .subscribe((subtiposCompra) => {
                expect(subtiposCompra).toEqual(subtiposCompraMock);
            });

        expect(gcRestService.get).toHaveBeenCalledWith(
            `/api/restricciones/v1/tipos-compras/${idTipoCompra}/subtipos-compras/todos`
        );
    });

    it('debería obtener una compra por ID', () => {
        const compraMock = { id: '123', nombre: 'Compra1', subtipoCompra: { id: 'SD', descTipoCompra: 'Sistema Dinamico' } } as CompraDTO;
        spyOn(gcRestService, 'get').and.returnValue(of(compraMock));

        service.getCompra().subscribe((res) => {
            return expect(res).toEqual(compraMock);
        });

        expect(gcRestService.get).toHaveBeenCalledWith(
            '/api/gestion-compra/v1/compras/{id}'
        );
    });

    it('debería obtener tipos de compra sin relacionar', () => {
        const tiposMock: TipoCompraDTO[] = [{ id: '2', descTipoCompra: 'Sin Relación' }];
        spyOn(gcRestService, 'get').and.returnValue(of(tiposMock));

        service.getTiposCompraSinRelacionar().subscribe((res) => {
            expect(res).toEqual(tiposMock);
        });

        expect(gcRestService.get).toHaveBeenCalledWith(
            '/api/restricciones/v1/tipos-compras/todos-sin-relacionar'
        );
    });

    it('debería obtener un subtipo de compra por tipo y subtipo', () => {
        const tipo = 'T1';
        const subtipo = 'ST1';
        const subtipoMock: SubtipoCompraDTO = {
            idSubtipoCompra: subtipo,
            descSubtipoCompra: 'Desc ST1',
            idTipoCompra: tipo,
            descTipoCompra: 'Desc T1'
        };

        spyOn(gcRestService, 'get').and.returnValue(of(subtipoMock));

        service.getSubTipoCompra(tipo, subtipo).subscribe((res) => {
            expect(res).toEqual(subtipoMock);
        });

        expect(gcRestService.get).toHaveBeenCalledWith(
            `/api/restricciones/v1/subtipos-compras/${tipo}/${subtipo}`
        );
    });

    it('debería obtener un subtipo de compra por tipo y subtipo', () => {
        const tipo = 'T1';
        const subtipo = 'ST1';
        const subtipoMock: SubtipoCompraDTO = {
            idSubtipoCompra: subtipo,
            descSubtipoCompra: 'Desc ST1',
            idTipoCompra: tipo,
            descTipoCompra: 'Desc T1'
        };

        spyOn(gcRestService, 'get').and.returnValue(of(subtipoMock));

        service.getSubTipoCompra(tipo, subtipo).subscribe((res) => {
            expect(res).toEqual(subtipoMock);
        });

        expect(gcRestService.get).toHaveBeenCalledWith(
            `/api/restricciones/v1/subtipos-compras/${tipo}/${subtipo}`
        );
    });

    it('debería obtener subtipos por tipo de compra sin relacionar', () => {
        const id = '123';
        const mockData: SubtipoCompraDTO[] = [
            {
                idSubtipoCompra: 'ST1',
                descSubtipoCompra: 'Sub1',
                idTipoCompra: id,
                descTipoCompra: 'Tipo'
            }
        ];

        spyOn(gcRestService, 'get').and.returnValue(of(mockData));

        service.getSubTiposCompraPorTipoCompraSinRelacionar(id).subscribe((res) => {
            expect(res).toEqual(mockData);
        });

        expect(gcRestService.get).toHaveBeenCalledWith(
            `/api/restricciones/v1/tipos-compras/${id}/subtipos-compras/todos-sin-relacionar`
        );
    });

    it('debería obtener subtipos por tipo de compra sin relacionar', () => {
        const id = '123';
        const mockData: SubtipoCompraDTO[] = [
            {
                idSubtipoCompra: 'ST1',
                descSubtipoCompra: 'Sub1',
                idTipoCompra: id,
                descTipoCompra: 'Tipo'
            }
        ];

        spyOn(gcRestService, 'get').and.returnValue(of(mockData));

        service.getSubTiposCompraPorTipoCompraSinRelacionar(id).subscribe((res) => {
            expect(res).toEqual(mockData);
        });

        expect(gcRestService.get).toHaveBeenCalledWith(
            `/api/restricciones/v1/tipos-compras/${id}/subtipos-compras/todos-sin-relacionar`
        );
    });

    it('debería obtener tipos de compra para relacionar', () => {
        const tipoId = 'T1';
        const subtipoId = 'ST1';
        const tiposMock: TipoCompraDTO[] = [{ id: '99', descTipoCompra: 'Relacionar' }];

        spyOn(gcRestService, 'get').and.returnValue(of(tiposMock));

        service.getTiposCompraRelacionar(tipoId, subtipoId).subscribe((res) => {
            expect(res).toEqual(tiposMock);
        });

        expect(gcRestService.get).toHaveBeenCalledWith(
            `/api/restricciones/v1/tipos-compras/relacionar/${tipoId}/${subtipoId}`
        );
    });

    it('debería obtener subtipos de compra para relacionar', () => {
        const tipoId = 'T1';
        const subtipoId = 'ST1';
        const tipoCompra = 'T2';

        const mockSubtipos: SubtipoCompraDTO[] = [{
            idSubtipoCompra: '1',
            descSubtipoCompra: 'Relacionado',
            idTipoCompra: tipoCompra,
            descTipoCompra: 'Tipo'
        }];

        spyOn(gcRestService, 'get').and.returnValue(of(mockSubtipos));

        service.getSubTiposCompraRelacionar(tipoId, subtipoId, tipoCompra).subscribe((res) => {
            expect(res).toEqual(mockSubtipos);
        });

        expect(gcRestService.get).toHaveBeenCalledWith(
            `/api/restricciones/v1/subtipos-compras/relacionar/${tipoId}/${subtipoId}/${tipoCompra}`
        );
    });

    it('debería obtener tipos de compra para relacionar por nómina', () => {
        const idNomina = 5;
        const tipoId = 'T1';
        const subtipoId = 'ST1';

        const mockTipos: TipoCompraDTO[] = [{ id: '7', descTipoCompra: 'Con Nómina' }];
        spyOn(gcRestService, 'get').and.returnValue(of(mockTipos));

        service.getTiposCompraRelacionarNomina(idNomina, tipoId, subtipoId).subscribe((res) => {
            expect(res).toEqual(mockTipos);
        });

        expect(gcRestService.get).toHaveBeenCalledWith(
            `/api/restricciones/v1/tipos-compras/relacionar/${idNomina}/${tipoId}/${subtipoId}`
        );
    });
    it('debería volver usando Location.back', () => {
        const location = TestBed.inject(Location);
        spyOn(location, 'back');
        service.volver();
        expect(location.back).toHaveBeenCalled();
    });
});
