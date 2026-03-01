import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';

import {
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import { AuthRawService } from 'src/app/shared/services/common/auth-raw-service';
import { FooterComponent } from './footer.component';

class MockServices {
    // router
    public events = of(
        new NavigationEnd(
            0,
            'http://localhost:4200/prueba',
            'http://localhost:4200/prueba',
        ),
    );
}
describe('FooterComponent', () => {
    let component: FooterComponent;
    let fixture: ComponentFixture<FooterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            // componentes
            declarations: [],
            imports: [FormsModule, ReactiveFormsModule, FooterComponent],
            providers: [
                FormBuilder,
                Router,
                AuthRawService,
                { provide: Router, useClass: MockServices },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FooterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });

    it('debería contener un elemento footer con rol contentinfo', () => {
        const footerEl: HTMLElement =
            fixture.nativeElement.querySelector('footer');
        expect(footerEl.getAttribute('role')).toBe('contentinfo');
    });
});
