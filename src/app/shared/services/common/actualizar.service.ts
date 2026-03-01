import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BsModalRef } from 'ngx-bootstrap/modal';
import { TipoMensajeEnum } from '../../enum/tipo-mensaje.enum';

@Injectable({
    providedIn: 'root',
})
export class ActualizarService {
    public popups: BsModalRef[] = [];
    private mensajeTemporal: [string[], TipoMensajeEnum] | null = null;
    public mensaje$ = new BehaviorSubject<
        [string[], TipoMensajeEnum] | [boolean] | []
    >([]);
    public confirmar$ = new BehaviorSubject<[string[], any, any] | []>([]);
    public alerta$ = new BehaviorSubject<
        [string] | [string, string] | [string, string, string] | []
    >([]);
    public cargando$ = new BehaviorSubject<boolean>(false);
    public error$ = new BehaviorSubject<[string] | []>([]);
    public titulo$ = new BehaviorSubject<[string] | []>([]);
    public subTitulo$ = new BehaviorSubject<[string] | []>([]);
    public estado$ = new BehaviorSubject<string>('');
    public capturarErrores: boolean = true;
    public subTitulo(subTitulo: string): void {
        this.subTitulo$.next([subTitulo]);
    }
    public titulo(titulo: string): void {
        this.titulo$.next([titulo]);
    }
    public estado(estado: string): void {
        this.estado$.next(estado);
    }
    public error(mensaje: string): void {
        this.error$.next([mensaje]);
    }

    public cargando(mostrar: boolean): void {
        this.cargando$.next(mostrar);
    }

    public confirmar(
        pregunta: string | string[],
        funcionAceptar: any,
        funcionCancelar: any = () => {},
    ): void {
        if (pregunta instanceof Array) {
            this.confirmar$.next([pregunta, funcionAceptar, funcionCancelar]);
        } else {
            this.confirmar$.next([[pregunta], funcionAceptar, funcionCancelar]);
        }
    }

    public alerta(mensaje: string): void {
        this.alerta$.next([mensaje]);
    }

    public mensajeModal(titulo: string, mensaje: string): void {
        this.alerta$.next([titulo, mensaje]);
    }

    public mensajeModalTextoAdicional(
        titulo: string,
        mensaje: string,
        textoAdicional: string,
    ): void {
        this.alerta$.next([titulo, mensaje, textoAdicional]);
    }

    public mensajeOcultar(): void {
        this.mensaje$.next([true]);
    }

    public mensajeGenerico(mensajes: string[], tipo: TipoMensajeEnum): void {
        this.mensaje$.next([mensajes, tipo]);
    }

    public mensajeCorrecto(mensajes: string | string[]): void {
        if (mensajes instanceof Array) {
            this.mensajeGenerico(mensajes, TipoMensajeEnum.success);
        } else {
            this.mensajeGenerico([mensajes], TipoMensajeEnum.success);
        }
    }

    public mensajeError(mensajes: string | string[]): void {
        if (mensajes instanceof Array) {
            this.mensajeGenerico(mensajes, TipoMensajeEnum.error);
        } else {
            this.mensajeGenerico([mensajes], TipoMensajeEnum.error);
        }
    }

    public mensajeAdvertencia(mensaje: string): void {
        this.mensajeGenerico([mensaje], TipoMensajeEnum.warn);
    }

    public mensajeInformacion(mensaje: string): void {
        this.mensajeGenerico([mensaje], TipoMensajeEnum.info);
    }

    public showMsgError(
        msg: string | string[],
        show: boolean,
        onChangeValuesFunc: () => void,
    ): void {
        if (show) {
            this.mensajeError(msg);
        } else {
            this.mensajeOcultar();
        }
        onChangeValuesFunc();
    }

    public guardarMensajeTemporal(
        mensajes: string | string[],
        tipo: TipoMensajeEnum = TipoMensajeEnum.success,
    ): void {
        const arr = Array.isArray(mensajes) ? mensajes : [mensajes];
        this.mensajeTemporal = [arr, tipo];
    }

    public emitirMensajeTemporalSiExiste(): void {
        if (this.mensajeTemporal) {
            this.mensaje$.next(this.mensajeTemporal);
            this.mensajeTemporal = null;
        }
    }
}
