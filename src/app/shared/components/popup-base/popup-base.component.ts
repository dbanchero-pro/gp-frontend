import { AfterViewInit, Directive, ElementRef, HostBinding, HostListener, inject, OnDestroy, ViewChild } from "@angular/core";
import { TipoMensajeEnum } from "../../enum/tipo-mensaje.enum";
import { ErrorInterceptor } from "../../interceptors/error.interceptor";
import { IColumnaOrden } from "../../models/common/columna-orden.model";
import { volverConConfirmacion } from "../../utils/functions";
import { PaginaBusquedaComponent } from "../pagina-busqueda/pagina-busqueda.component";

@Directive({
    selector: '[appPopupBase]',

})
export abstract class PopupBaseComponent extends PaginaBusquedaComponent<any> implements AfterViewInit, OnDestroy {
    @ViewChild('modalRoot', { static: false }) modalRoot!: ElementRef<HTMLElement>;
    @HostBinding('attr.tabindex') hostTabindex = -1;

    resultMsg: string[] = [''];
    showMsg = false;
    typeMsg = TipoMensajeEnum.error;
    private opened = false;
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly focusableSelectors = [
        'a[href]:not([disabled])',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"]):not([disabled])',
    ].join(',');

    constructor() {
        super();
    }
    protected deshabilitarCapturaErrores(): void {
        this.actualizarService.capturarErrores = false;
    }

    ngAfterViewInit(): void {
        // El modal ya está en el DOM: lo marcamos como abierto y lo enfocamos
        this.opened = true;
        this.focusFirstElement();
    }


    ngOnDestroy(): void {
        this.opened = false;
    }

    /** Enganchamos todos los cambios de foco dentro del documento */
    @HostListener('document:focusin', ['$event'])
    onDocumentFocusIn(event: FocusEvent): void {
        if (!this.opened) {
            return;
        }

        const target = event.target as HTMLElement | null;
        const modalEl = this.getModalElement();

        if (!target || !modalEl) {
            return;
        }

        const modalRef = this.actualizarService.popups?.at(this.actualizarService.popups.length - 1);

        if (!modalRef?.content?.elementRef?.nativeElement.contains(target)) {
                this.focusFirstElement();
        }
    }

    private focusFirstElement(): void {
        
        const modalEl = this.getModalElement();
        if (!modalEl) return;

        const focusables = this.getFocusableElements();

        const first = focusables[0] ?? modalEl;
        first.focus();
    }


    @HostListener('keydown', ['$event'])
    public handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.key === 'Tab') {
            this.trapFocus(event);
        }
    }

    private trapFocus(event: KeyboardEvent): void {
        const focusableElements = this.getFocusableElements();
        if (focusableElements.length === 0) {
            return;
        }

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }
    }

    private getFocusableElements(): HTMLElement[] {
        
        const modalRef = this.actualizarService.popups?.at(this.actualizarService.popups.length - 1);
        
        let modalEl = this.getModalElement();
        if (modalRef?.content?.elementRef?.nativeElement) {
            modalEl = modalRef?.content?.elementRef?.nativeElement;
        }

        if (!modalEl) {
            return [];
        }

        return Array.from(
            modalEl.querySelectorAll<HTMLElement>(this.focusableSelectors)
        );
    }

    private getModalElement(): HTMLElement | null {
        return this.modalRoot?.nativeElement ?? this.elementRef?.nativeElement ?? null;
    }

    public procesarError(error: any, mensajePorDefecto?: string): void {

        this.showMsg = false;
        setTimeout(() => {
            let errorMensaje: string[] | string;

            if (typeof error === 'string') {
                errorMensaje = [error];
            } else if (error.status === 409 && error.error?.mensajes &&
                error.error.mensajes.length > 0 &&
                error.error.mensajes[0]?.descripcion
            ) {
                errorMensaje = [error.error.mensajes[0].descripcion ?? mensajePorDefecto ?? 'Error desconocido'];
            } else {
                errorMensaje = ErrorInterceptor.procesarErrorMessage(error);

            }

            this.actualizarService.capturarErrores = true;
            if (typeof errorMensaje === 'string') {
                errorMensaje = [errorMensaje];
            }
            this.resultMsg = errorMensaje;
            this.typeMsg = TipoMensajeEnum.error;
            this.showMsg = true;

        }, 500);


    }

    columnaOrdenInicial: string = '';
    ordenInicial: 'asc' | 'desc' = 'asc';
    listaOrden: IColumnaOrden[] = [];

    buscar(): void {
        throw new Error('Función no implementada');
    }

    cancelarConConfirmacion(): void {
        volverConConfirmacion(this.actualizarService, () => this.cerrarPopup(), this.form);
    }


    // Método público para mostrar errores desde el componente padre
    public mostrarError(error: any, mensaje?: string): void {
        this.procesarError(error, mensaje);
    }
}


