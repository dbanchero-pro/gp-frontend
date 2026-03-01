import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    Directive,
    EventEmitter,
    HostListener,
    Input,
    Output,
    QueryList,
    TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { NgxDaterangepickerBootstrapModule } from 'ngx-daterangepicker-bootstrap';
import { NgxEditorModule } from 'ngx-editor';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@Directive({ selector: '[appTab]', standalone: true })
export class AppTabDirective {
    @Input('appTab') titulo!: string;
    @Input() deshabilitado = false;
    constructor(public tpl: TemplateRef<any>) {}
}
@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    styleUrls: ['./tabs.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        AlertModule,
        BsDropdownModule,
        BsDatepickerModule,
        ModalModule,
        PaginationModule,
        TabsModule,
        TooltipModule,
        TypeaheadModule,
        NgxDaterangepickerBootstrapModule,
        NgxEditorModule,
        NgxDatatableModule,
    ],
})
export class TabsComponent implements AfterContentInit {
    @ContentChildren(AppTabDirective) tabs!: QueryList<AppTabDirective>;

    @Input() selectedIndex = 0;
    @Input() lazy = true;
    @Input() classTab = '';
    @Output() selectedIndexChange = new EventEmitter<number>();
    private readonly _cargados = new Set<number>();

    constructor(private readonly cdr: ChangeDetectorRef) {}

    ngAfterContentInit(): void {
        this.ensureValidSelection();
        this.marcarCargado(this.selectedIndex);

        this.tabs.changes.subscribe(() => {
            this.ensureValidSelection();
            this.cdr.markForCheck();
        });
    }

    get enabledTabs(): number[] {
        return this.tabs
            ? this.tabs
                  .toArray()
                  .map((t, i) => (t.deshabilitado ? -1 : i))
                  .filter((i) => i >= 0)
            : [];
    }

    cambiarTab(index: number): void {
        if (!this.tabs || index < 0 || index >= this.tabs.length) return;
        const tab = this.tabs.get(index);
        if (!tab || tab.deshabilitado) return;

        if (this.selectedIndex !== index) {
            this.selectedIndex = index;
            this.selectedIndexChange.emit(this.selectedIndex);
            this.marcarCargado(index);
            this.cdr.markForCheck();
        }
    }

    private marcarCargado(index: number) {
        if (this.lazy) this._cargados.add(index);
    }

    estaCargado(index: number): boolean {
        return this.lazy ? this._cargados.has(index) : true;
    }

    private ensureValidSelection(): void {
        if (!this.tabs || this.tabs.length === 0) {
            this.selectedIndex = 0;
            return;
        }
        if (
            this.selectedIndex < 0 ||
            this.selectedIndex >= this.tabs.length ||
            this.tabs.get(this.selectedIndex)?.deshabilitado
        ) {
            const firstEnabled = this.tabs
                .toArray()
                .findIndex((t) => !t.deshabilitado);
            this.selectedIndex = Math.max(0, firstEnabled);
            this.selectedIndexChange.emit(this.selectedIndex);
        }
    }

    @HostListener('keydown', ['$event'])
    handleKeydown(e: KeyboardEvent) {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();

        const enabled = this.enabledTabs;
        if (enabled.length === 0) return;

        const currentPos = enabled.indexOf(this.selectedIndex);
        let nextIndex = this.selectedIndex;

        switch (e.key) {
            case 'ArrowRight':
                nextIndex = enabled[(currentPos + 1) % enabled.length];
                break;
            case 'ArrowLeft':
                nextIndex =
                    enabled[(currentPos - 1 + enabled.length) % enabled.length];
                break;
            case 'Home':
                nextIndex = enabled[0];
                break;
            case 'End':
                nextIndex = enabled[enabled.length - 1];
                break;
        }
        this.cambiarTab(nextIndex);
    }

    tabId(i: number) {
        return `tab-${i}`;
    }
    panelId(i: number) {
        return `tabpanel-${i}`;
    }
}
