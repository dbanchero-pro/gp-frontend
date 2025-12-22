import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RestApiService } from './rest-api.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('RestApiService', () => {
  let service: RestApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [RestApiService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    service = TestBed.inject(RestApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('debería realizar una petición PUT', () => {
    const url = 'https://example.com/api/data';
    const requestData = { key: 'value' };
    const responseData = { result: 'success' };

    service.put(url, requestData).subscribe(data => {
      expect(data).toEqual(responseData);
    });

    const req = httpTestingController.expectOne(url);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(JSON.stringify(requestData));
    req.flush(responseData);
  });

  it('debería realizar una petición PATCH', () => {
    const url = 'https://example.com/api/data';
    const responseData = { result: 'success' };

    service.patch(url).subscribe(data => {
      expect(data).toEqual(responseData);
    });

    const req = httpTestingController.expectOne(url);
    expect(req.request.method).toBe('PATCH');
    req.flush(responseData);
  });

  it('debería realizar una petición DELETE', () => {
    const url = 'https://example.com/api/data';
    const responseData = { result: 'success' };

    service.delete(url).subscribe(data => {
      expect(data).toEqual(responseData);
    });

    const req = httpTestingController.expectOne(url);
    expect(req.request.method).toBe('DELETE');
    req.flush(responseData);
  });

  it('debería realizar una petición GET', () => {
    const url = 'https://example.com/api/data';
    const responseData = { result: 'ok' };

    service.get(url).subscribe(data => {
      expect(data).toEqual(responseData);
    });

    const req = httpTestingController.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush(responseData);
  });

  it('debería realizar una petición POST', () => {
    const url = 'https://example.com/api/data';
    const requestData = { x: 1 };
    const responseData = { result: 'ok' };

    service.post(url, requestData).subscribe(data => {
      expect(data).toEqual(responseData);
    });

    const req = httpTestingController.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(JSON.stringify(requestData));
    req.flush(responseData);
  });
  afterEach(() => {
    httpTestingController.verify();
  });
});