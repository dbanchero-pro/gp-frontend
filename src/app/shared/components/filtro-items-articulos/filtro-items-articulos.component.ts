import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import {
    Observable,
    Subject,
    debounceTime,
    distinctUntilChanged,
    of,
    switchMap,
} from 'rxjs';
import { IBusquedaItemDTO } from 'src/app/shared/models/busqueda-item.model';
import { TipoBusqueda } from '../../enum/tipo-busqueda-item.enum';
import { TipoPerfil } from '../../enum/tipo-perfil.enum';
import { FiltroBusquedaArticulosDTO } from '../../models/filtros/filtro-busqueda-articulos.model';
import { FiltroItemCompraDTO } from '../../models/filtros/filtro-item-compra.model';
import { ItemCompraFiltroDTO } from '../../models/item-compra-filtro.model';
import { ItemsCompraService } from '../../services/items-compra.service';
import { UsuarioOrganismoPerfilService } from '../../services/usuario/usuario-perfil.service';

@Component({
    selector: 'app-filtro-items-articulos',
    templateUrl: './filtro-items-articulos.component.html',
    styleUrls: ['./filtro-items-articulos.component.scss'],
})
export class FiltroItemsArticulosComponent implements OnInit {

    @Input() idCompra: number | undefined = undefined;
    @Input() disabled = false;
    @Input() tipoPerfil?: TipoPerfil;
    @Input() modoCliente = false;
    @Input() articulosCualquierOrdenCompra = false;
    @Input() usarItemsOrdenCompra = false;
    itemsInterno: Observable<ItemCompraFiltroDTO[]> = of([]);
    @Input() items: ItemCompraFiltroDTO[] = [];

    @Input() filtroParaBusqueda?: FiltroBusquedaArticulosDTO;

    @Input() filtroInicial?: FiltroItemCompraDTO;

    @Output() cambioFiltro = new EventEmitter<IBusquedaItemDTO>();

    tipoBusqueda: FormControl = new FormControl(TipoBusqueda.NROITEM);
    busqueda: FormControl = new FormControl('');
    articuloBusquedaTexto: FormControl = new FormControl('');
    itemBusquedaTexto: FormControl = new FormControl('');
    articuloBusquedaArticulo$: Subject<string> = new Subject();
    TipoBusqueda = TipoBusqueda;

    constructor(
        private readonly itemCompraService: ItemsCompraService,
        private readonly usuarioPerfilService: UsuarioOrganismoPerfilService
    ) { }

    ngOnInit(): void {
        if (this.disabled) this.setDisabledState(true);

        this.itemsInterno = this.articuloBusquedaArticulo$.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap((texto: string) => {
                if (!texto) return of([]);
                if (this.tipoBusqueda.value === TipoBusqueda.NROITEM && isNaN(+texto)) {
                    return of([]);
                } else if (this.modoCliente) {
                    return this.buscarEnCliente(texto);
                        
                } else if (!this.idCompra) {
                    const filtros: FiltroBusquedaArticulosDTO = {
                        ...this.filtroParaBusqueda,
                        filtrarPorArticulo: this.tipoBusqueda.value === TipoBusqueda.ARTICULO,
                        nroItem: this.tipoBusqueda.value === TipoBusqueda.NROITEM ? texto : undefined,
                        descripcionArticulo: this.tipoBusqueda.value === TipoBusqueda.ARTICULO ? texto : undefined,
                    };
                    return this.usuarioPerfilService.buscarArticulos(this.tipoPerfil ?? TipoPerfil.Conformidad, filtros);
                } 
                else {
                    return this.itemCompraService.buscarPorArticulo( this.idCompra, texto, this.tipoBusqueda.value );
                }
            })
        );
        this.limpiar();

        if (this.filtroInicial?.item) {
            const texto = this.filtroInicial.item.toString();
            this.tipoBusqueda.setValue(this.filtroInicial.tipoBusqueda ?? TipoBusqueda.NROITEM);
            if (this.filtroInicial.tipoBusqueda === TipoBusqueda.NROITEM) {
                this.itemBusquedaTexto.setValue(texto);
                this.busqueda.setValue(texto);
            } else if (this.filtroInicial.tipoBusqueda === TipoBusqueda.ARTICULO) {
                this.articuloBusquedaTexto.setValue(texto);
                this.busqueda.setValue(texto);
            }
            this.cambioDatosFiltros();
        }
    }

    buscarEnCliente(texto: string): Observable<ItemCompraFiltroDTO[]> {
        if (this.tipoBusqueda.value === TipoBusqueda.NROITEM && isNaN(+texto)) {
            return of([]);
        } else if (this.tipoBusqueda.value === TipoBusqueda.NROITEM) {
            return of(this.items.filter((item: ItemCompraFiltroDTO) => item.nroItem === texto));
        } else if (this.tipoBusqueda.value === TipoBusqueda.ARTICULO) {
            return of(this.items.filter((item: ItemCompraFiltroDTO) =>
                item.descripcionItem?.toLowerCase().includes(texto.toLowerCase())
                || item.descArticulo?.toLowerCase().includes(texto.toLowerCase()))
            );
        } else {
            return of([]);
        }
    }

    buscar(event: Event) {
        const texto = (event.target as HTMLInputElement).value;
        if (!texto) {
            return;
        }
        if (this.tipoBusqueda.value === TipoBusqueda.NROITEM && isNaN(Number(texto))) {
            return;
        }
        this.articuloBusquedaArticulo$.next(texto);
    }

    public setDisabledState(state: boolean): void {
        this.disabled = state;
        const fn = state ? 'disable' : 'enable';
        (this.tipoBusqueda as any)[fn]({ emitEvent: false });
        (this.busqueda as any)[fn]({ emitEvent: false });
        (this.articuloBusquedaTexto as any)[fn]({ emitEvent: false });
        (this.itemBusquedaTexto as any)[fn]({ emitEvent: false });
    }

    cambioDatosFiltros() {
        const busqueda: IBusquedaItemDTO = {
            tipoBusqueda: this.tipoBusqueda?.value,
            item: this.busqueda.value,
        };
        this.cambioFiltro.emit(busqueda);
    }

    cambioArticulo(event: TypeaheadMatch | null, tipoBusqueda: TipoBusqueda) {
        
        if (event && this.tipoBusqueda.value === TipoBusqueda.ARTICULO) {
            const value = event.item.descArticulo;
            this.busqueda.setValue(value);
            this.itemBusquedaTexto.setValue('');
            this.articuloBusquedaTexto.setValue(value);
            this.cambioDatosFiltros();
        } else {
            this.articuloBusquedaTexto.setValue('');
            this.busqueda.setValue('');
            this.cambioDatosFiltros();
        }
        if (tipoBusqueda == TipoBusqueda.NROITEM && tipoBusqueda !== this.tipoBusqueda.value) {
            this.itemBusquedaTexto.setValue('');
        }

        
        this.busqueda.setValue(
            this.tipoBusqueda.value === TipoBusqueda.NROITEM
                ? this.itemBusquedaTexto.value
                : this.articuloBusquedaTexto.value
        );
    }

    cambioItem(event: Event | null): void {
        const esBusquedaPorItem =
            this.tipoBusqueda.value === TipoBusqueda.NROITEM;

        if (event && esBusquedaPorItem) {
            const valorInput = (event.target as HTMLInputElement).value;
            this.itemBusquedaTexto.setValue(valorInput);
        } else {
            this.itemBusquedaTexto.setValue('');
        }

        const valorBusqueda = esBusquedaPorItem
            ? this.itemBusquedaTexto.value
            : this.articuloBusquedaTexto.value;
        this.busqueda.setValue(valorBusqueda);
        this.cambioDatosFiltros();
    }

    inputSoloNumeros(event: any): any {
        let ret = true;
        let value = event.target.value;
        let aux = value.replace(/\D/g, '');
        if (aux.charAt(0) === '0') {
            aux = value.substr(1);
        }
        if (aux.length > 3) {
            aux = aux.substr(0, 3);
        }
        ret = event.target.value !== aux;
        event.target.value = aux;
        return ret;
    }

    limpiar() {
        this.tipoBusqueda.setValue(TipoBusqueda.NROITEM);
        this.busqueda.setValue('');
        this.articuloBusquedaTexto.setValue('');
        this.itemBusquedaTexto.setValue('');

        this.articuloBusquedaArticulo$.next('');
        this.cambioDatosFiltros();
    }
}


