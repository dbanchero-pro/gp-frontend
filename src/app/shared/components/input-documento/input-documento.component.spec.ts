import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { InputDocumentoComponent } from './input-documento.component';

describe('InputDocumentoComponent', () => {
  let component: InputDocumentoComponent;
  let fixture: ComponentFixture<InputDocumentoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InputDocumentoComponent],
      imports: [FormsModule]
    });
    fixture = TestBed.createComponent(InputDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('formatearValor para cédula', () => {
    component.esCedula = true;
    expect(component.formatearValor('1234567')).toBe('123.456-7');
  });

  it('onInput actualiza valor y formatea', () => {
    component.esCedula = true;
    const el = component.inputRef.nativeElement;
    el.value = '1234567';
    component.onInput({ target: el } as any);
    expect(el.value).toBe('123.456-7');
  });

  it('onBlur emite valor formateado', () => {
    const spy = spyOn(component as any, 'onChange');
    const spyTouched = spyOn(component as any, 'onTouched');
    component.esCedula = true;
    const el = component.inputRef.nativeElement;
    el.value = '1234567';
    component.onInput({ target: el } as any);
    component.onBlur();
    expect(spy).toHaveBeenCalledWith('1234567');
    expect(spyTouched).toHaveBeenCalled();
  });

  it('onKeyPress emite evento cuando es Enter', () => {
    const spy = spyOn(component.enter, 'emit');
    component.onKeyPress({ key: 'Enter' } as any);
    expect(spy).toHaveBeenCalled();
  });
});
