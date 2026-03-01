import { TestBed } from '@angular/core/testing';
import { PreloadAllModules, PreloadingStrategy, Router } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { Pagina403Component } from './shared/components/pagina403/pagina403.component';
import { AuthGuard } from './shared/guards/auth-guard';
import { HomeComponent } from './template/components/home/home.component';

describe('AppRoutingModule', () => {
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppRoutingModule],
        }).compileComponents();
        router = TestBed.inject(Router);
    });

    it('usa la estrategia PreloadAllModules', () => {
        const strategy = TestBed.inject(PreloadingStrategy);
        expect(strategy instanceof PreloadAllModules).toBeTrue();
    });

    it('contiene las rutas estáticas esperadas', () => {
        const inicio = router.config.find((r) => r.path === 'inicio');
        const error403 = router.config.find((r) => r.path === '403');
        expect(inicio?.component).toBe(HomeComponent);
        expect(error403?.component).toBe(Pagina403Component);
    });

    it('contiene rutas lazy protegidas', () => {
        const pliegos = router.config.find((r) => r.path === 'pliegos');
        expect(pliegos?.canActivate?.[0]).toBe(AuthGuard);
    });

    it('redirecciona rutas desconocidas', () => {
        const wildcard = router.config.find((r) => r.path === '**');
        expect(wildcard?.redirectTo).toBe('');
    });
});
