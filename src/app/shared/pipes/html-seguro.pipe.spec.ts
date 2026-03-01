import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { HtmlSeguroPipe } from './html-seguro.pipe';

describe('HtmlSeguroPipe', () => {
    let pipe: HtmlSeguroPipe;
    let sanitizer: DomSanitizer;
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [HtmlSeguroPipe] });
        pipe = TestBed.inject(HtmlSeguroPipe);
        sanitizer = TestBed.inject(DomSanitizer);
    });

    it('debe delegar en el sanitizer', () => {
        spyOn(sanitizer, 'bypassSecurityTrustHtml');
        pipe.transform('<b>hola</b>');
        expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalled();
    });
});
