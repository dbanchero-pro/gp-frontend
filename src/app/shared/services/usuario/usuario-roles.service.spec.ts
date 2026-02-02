import { TestBed } from '@angular/core/testing';
import { UsuarioRolesService } from './usuario-roles.service';

describe('UsuarioRolesService', () => {
    let service: UsuarioRolesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UsuarioRolesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
