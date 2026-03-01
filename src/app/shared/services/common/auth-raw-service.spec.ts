import { AuthRawService } from './auth-raw-service';
import { KeycloakService } from 'keycloak-angular';

class KeycloakServiceMock {
    clearToken = jasmine.createSpy('clearToken');
    login = jasmine.createSpy('login').and.returnValue(Promise.resolve());
    logout = jasmine.createSpy('logout').and.returnValue(Promise.resolve());
    getToken = jasmine
        .createSpy('getToken')
        .and.returnValue(Promise.resolve('tok'));
    isLoggedIn = jasmine.createSpy('isLoggedIn').and.returnValue(true);
    updateToken = jasmine
        .createSpy('updateToken')
        .and.returnValue(Promise.resolve(true));
    loadUserProfile = jasmine
        .createSpy('loadUserProfile')
        .and.returnValue(Promise.resolve({} as any));
}

describe('AuthRawService', () => {
    let service: AuthRawService;
    let mock: KeycloakServiceMock;

    beforeEach(() => {
        mock = new KeycloakServiceMock();
        service = new AuthRawService(mock as unknown as KeycloakService);
    });

    it('clearToken delega en keycloak', () => {
        service.clearToken();
        expect(mock.clearToken).toHaveBeenCalled();
    });

    it('login delega en keycloak', async () => {
        await service.login({});
        expect(mock.login).toHaveBeenCalledWith({});
    });

    it('logout delega en keycloak', async () => {
        await service.logout();
        expect(mock.logout).toHaveBeenCalled();
    });

    it('getToken delega en keycloak', async () => {
        const token = await service.getToken();
        expect(token).toBe('tok');
        expect(mock.getToken).toHaveBeenCalled();
    });

    it('isLoggedIn delega en keycloak', () => {
        expect(service.isLoggedIn()).toBeTrue();
        expect(mock.isLoggedIn).toHaveBeenCalled();
    });

    it('updateToken delega en keycloak', async () => {
        await service.updateToken(5);
        expect(mock.updateToken).toHaveBeenCalledWith(5);
    });

    it('updateToken usa valor por defecto cuando no se pasa argumento', async () => {
        await service.updateToken();
        expect(mock.updateToken).toHaveBeenCalledWith(30);
    });

    it('loadUserProfile delega en keycloak', async () => {
        await service.loadUserProfile();
        expect(mock.loadUserProfile).toHaveBeenCalled();
    });
});
