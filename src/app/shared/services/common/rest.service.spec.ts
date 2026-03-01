import { HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { RestApiService } from './rest-api.service';
import { RestService } from './rest.service';

describe('GcRestService', () => {
    let restApi: jasmine.SpyObj<RestApiService>;
    let service: RestService;

    beforeEach(() => {
        AppConfig.settings = { apiUrl: '/api' } as any;
        restApi = jasmine.createSpyObj('RestApiService', [
            'get',
            'post',
            'put',
            'patch',
            'delete',
        ]);
        restApi.get.and.returnValue(of(null));
        restApi.post.and.returnValue(of(null));
        restApi.put.and.returnValue(of(null));
        restApi.patch.and.returnValue(of(null));
        restApi.delete.and.returnValue(of(null));
        service = new RestService(restApi);
    });

    it('get concatena la URL base', () => {
        service.get('/x');
        expect(restApi.get).toHaveBeenCalledWith(
            '/api/x',
            jasmine.any(HttpParams),
        );
    });

    it('post concatena la URL base', () => {
        service.post('/x', { a: 1 });
        expect(restApi.post).toHaveBeenCalledWith(
            '/api/x',
            { a: 1 },
            jasmine.any(HttpParams),
        );
    });

    it('put concatena la URL base', () => {
        service.put('/x', { a: 1 });
        expect(restApi.put).toHaveBeenCalledWith('/api/x', { a: 1 });
    });

    it('patch concatena la URL base', () => {
        service.patch('/x');
        expect(restApi.patch).toHaveBeenCalledWith('/api/x');
    });

    it('delete concatena la URL base', () => {
        service.delete('/x');
        expect(restApi.delete).toHaveBeenCalledWith('/api/x');
    });
});
