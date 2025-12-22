import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { UtilService } from './services/common/util.service';
import { SharedModule } from './shared.module';

describe('SharedModule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule]
    }).compileComponents();
  });

  it('debería proveer UtilService', () => {
    const service = TestBed.inject(UtilService);
    expect(service).toBeTruthy();
  });

  it('debería registrar los interceptors HTTP', () => {
    const interceptors = TestBed.inject(HTTP_INTERCEPTORS);
    const hasError = interceptors.some(i => i instanceof ErrorInterceptor);
    const hasLoading = interceptors.some(i => i instanceof LoadingInterceptor);
    expect(hasError && hasLoading).toBeTrue();
  });
});
