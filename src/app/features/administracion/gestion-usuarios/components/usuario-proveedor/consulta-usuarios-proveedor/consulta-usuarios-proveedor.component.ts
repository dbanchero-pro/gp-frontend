import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UsuarioAgrupadoDTO } from 'src/app/features/administracion/gestion-usuarios/models/usuario-agrupado.model';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { Pais } from 'src/app/shared/enum/pais.enum';
import { TipoDocumentoUsuario } from 'src/app/shared/enum/tipo-documento-usuario.enum';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { IPaisDTO } from 'src/app/shared/models/common/pais.model';
import { ITipoDocumentoUsuarioDTO } from 'src/app/shared/models/usuario/tipo-documento-usuario.model';
import { UsuarioProveedorDTO } from 'src/app/shared/models/usuario/usuario-proveedor.model';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { PaisService } from 'src/app/shared/services/usuario/pais.service';
import { TipoDocumentoUsuarioService } from 'src/app/shared/services/usuario/tipo-documento-usuario.service';
import { UsuarioProveedorService } from 'src/app/shared/services/usuario/usuario-proveedor.service';
import { formatearCI } from 'src/app/shared/utils/functions';
import { IConsultaUsuarioProveedorFiltroDTO } from '../../../models/consulta-usuario-proveedor-filtro.model';
import { DatosInicialesModificarDTO } from '../../../models/datos-iniciales-modificar.model';
import { UsuarioProveedorGuardarDTO } from '../../../models/usuario-proveedor-guardar.model';
import { AgregarModificarProveedorPopupComponent } from '../agregar-modificar-proveedor-popup/agregar-modificar-proveedor-popup.component';
import { VincularEmpresaPopupComponent } from '../vincular-empresa-popup/vincular-empresa-popup.component';

@Component({
    selector: 'app-consulta-usuarios-proveedor',
    templateUrl: './consulta-usuarios-proveedor.component.html',
    styleUrls: ['./consulta-usuarios-proveedor.component.scss'],
    standalone: false,
})
export class ConsultaUsuariosProveedorComponent
    extends PaginaBusquedaComponent<IConsultaUsuarioProveedorFiltroDTO>
    implements OnInit {
    usuarios: UsuarioAgrupadoDTO[] = [];

    columnaOrdenInicial = 'nroDocumento';
    ordenInicial: 'asc' | 'desc' = 'asc';

    listaOrden: IColumnaOrden[] = [
        { id: 'nroDocumento', nombre: 'N° documento' },
        { id: 'nombre', nombre: 'Nombre' },
    ];

    tiposDocumento: ITipoDocumentoUsuarioDTO[] = [];
    tiposDocumentoGeneral: ITipoDocumentoUsuarioDTO[] = [];
    paises: IPaisDTO[] = [];
    TipoUsuario = TipoUsuario;

    tipoUsuario!: TipoUsuario;

    Pais = Pais;
    TipoDocumentoUsuario = TipoDocumentoUsuario;

    constructor(
        private readonly fb: FormBuilder,
        private readonly paisService: PaisService,
        private readonly tipoDocumentoService: TipoDocumentoUsuarioService,
        private readonly usuarioProveedorService: UsuarioProveedorService,
        protected readonly seguridad: SeguridadService
    ) {
        super();
        this.tipoUsuario = this.seguridad.obtenerTipoUsuario();
    }

    override ngOnInit(): void {
        super.ngOnInit();

        this.form = this.fb.group({
            paisControl: [''],
            tipoDocControl: [''],
            nroDocumento: [''],
        });

        this.tipoUsuario = this.seguridad.obtenerTipoUsuario();

        this.actualizarService.tipoUsuario$.subscribe((tipoUsuario) => {
            if (tipoUsuario !== undefined) {
                this.tipoUsuario = tipoUsuario;
                this.nuevaConsulta();
            }
        });

        this.cargarPaises();
        this.cargarTiposDocumento(TipoDocumentoUsuario.CEDULA_IDENTIDAD);
        this.cargarTiposDocumentoGeneral();
    }

    ngAfterViewInit(): void {
        this.actualizarFiltrosYBuscar();
    }

    cambioPais(): void {
        let tipoDoc = '';
        const paisSeleccionado = this.form.get('paisControl')!.value;

        if (paisSeleccionado === Pais.URUGUAY) {
            tipoDoc = TipoDocumentoUsuario.CEDULA_IDENTIDAD;
        } else {
            this.form.get('tipoDocControl')!.setValue('');
        }

        this.cargarTiposDocumento(tipoDoc);

        this.form.get('nroDocumento')?.setValue('');

        // Reaplicar mask cuando cambia el país
        setTimeout(() => {
            const ctrl = this.form.get('nroDocumento');
            if (ctrl) {
                ctrl.setValue(ctrl.value);
            }
        });
    }

    cambioTipoDoc(): void {
        setTimeout(() => {
            const ctrl = this.form.get('nroDocumento');
            if (ctrl) {
                ctrl.setValue(ctrl.value);
            }
        });
    }

    cargarPaises(): void {
        this.paisService.obtenerTodos().subscribe((paises) => {
            this.paises = paises;
        });
    }

    cargarTiposDocumento(valorDefecto: string): void {
        const pais = this.form.get('paisControl')?.value;
        if (!pais) {
            this.tiposDocumento = [];
            this.form.get('tipoDocControl')!.setValue('');
            return;
        }

        if (valorDefecto) {
            this.form.get('tipoDocControl')!.setValue(valorDefecto);
        }

        this.tipoDocumentoService
            .obtenerTiposDocumentoUsuario(
                0,
                1000,
                'id.idTipoDocumento,asc',
                pais
            )
            .subscribe((resp) => {
                this.tiposDocumento = resp.content;
            });
    }

    cargarTiposDocumentoGeneral(): void {
        this.tipoDocumentoService
            .obtenerTiposDocumentoUsuario(
                0,
                1000,
                'id.idTipoDocumento,asc'
            )
            .subscribe((resp) => {
                this.tiposDocumentoGeneral = resp.content;
            });
    }

    eliminarUsuarioProveedor(
        usuarioAgrupado: UsuarioAgrupadoDTO,
        usuarioProveedor: UsuarioProveedorDTO
    ): void {
        const empresa = usuarioProveedor.proveedor;
        const paisDocumentoProveedor: string = empresa?.paisDocumento?.id ?? '';
        const tipoDocProveedor: string = empresa?.tipoDocumento ?? '';
        const nroDocProveedor: string = empresa?.nroDocumento ?? '';

        this.actualizarService.confirmar(
            '¿Está seguro que desea eliminar el vínculo?',
            () => {
                this.usuarioProveedorService
                    .eliminarUsuarioProveedor(
                        usuarioAgrupado.idUsuario.toLowerCase(),
                        paisDocumentoProveedor,
                        tipoDocProveedor,
                        nroDocProveedor
                    )
                    .subscribe(() => {
                        this.actualizarService.mensajeCorrecto(
                            'Se ha eliminado el vínculo con el proveedor de forma exitosa.'
                        );
                        this.buscar();
                    });
            }
        );
    }

    actualizarFiltrosYBuscar(): void {
        this.actualizarFiltro();
        this.buscar(true);
    }


    buscar(resetearPagina: boolean = false): void {
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            return;
        }

        if (resetearPagina) {
            this.parametros.pagina = 0;
        }

        const params = {
            pageNumber: this.parametros.pagina ?? 0,
            pageSize: this.parametros.tamanoPagina,
            sort: this.parametros.sort,
            order: this.parametros.order,
        };
        if (this.tipoUsuario === TipoUsuario.PROVEEDOR) {

            this.usuarioProveedorService.obtenerTodosUsuariosProveedores(
                this.parametros.filtro,
                params.pageNumber,
                params.pageSize,
                `${params.sort},${params.order}`
            )
                .subscribe((resp) => {
                    this.usuarios = this.agruparUsuarios(resp.content);
                    this.total = resp.page?.totalElements;
                });
        } else {
            this.usuarioProveedorService.obtenerTodosUsuariosProveedoresUsuarioOrganismos(
                this.parametros.filtro,
                params.pageNumber,
                params.pageSize,
                `${params.sort},${params.order}`
            )
                .subscribe((resp) => {
                    this.usuarios = this.agruparUsuarios(resp.content);
                    this.total = resp.page?.totalElements;
                });
        }
    }

    private actualizarFiltro(): void {
        const pais = this.form.get('paisControl')?.value;
        const tipoDoc = this.form.get('tipoDocControl')?.value;
        let nroDoc = this.form.get('nroDocumento')?.value;
        if (nroDoc) {
            nroDoc = nroDoc.replace(/\D/g, '');
        }
        this.parametros.filtro = {
            idPais: pais,
            idTipoDocumento: tipoDoc,
            nroDocumento: nroDoc,
        };
    }

    override nuevaConsulta(): void {
        const valorPais = this.form.get('paisControl')?.value;

        this.form.patchValue(
            {
                paisControl: '',
                tipoDocControl: '',
                nroDocumento: '',
            },
            { emitEvent: false }
        );

        this.parametros.filtro = {};
        this.parametros.pagina = 0;
        this.parametros.order = this.ordenInicial;
        this.parametros.sort = this.columnaOrdenInicial;
        this.usuarios = [];
        this.total = -1;

        //Cargar los tipos de documentos para UY asignaba "Todos los tipos de documentos" en el combo en lugar de CI
        if (valorPais !== Pais.URUGUAY) {
            this.cargarTiposDocumento(TipoDocumentoUsuario.CEDULA_IDENTIDAD);
        }

        this.actualizarFiltrosYBuscar();
    }

    override descargarExcel(): void {
        if (this.tipoUsuario === TipoUsuario.PROVEEDOR) {
            this.usuarioProveedorService.exportarExcelUsuariosProveedor(
                this.parametros.filtro
            );
        } else {
            this.usuarioProveedorService.exportarExcelUsuariosProveedorUsuarioOrganismo(
                this.parametros.filtro
            );
        }
    }

    obtenerAccionesEmpresa(
        usuarioAgrupado: UsuarioAgrupadoDTO,
        usuarioProveedor: UsuarioProveedorDTO,
        tipoUsuario: TipoUsuario
    ): AccionBoton[] {
        let acciones: AccionBoton[] = [];
        if (tipoUsuario === TipoUsuario.PROVEEDOR) {
            acciones.push({
                nombre: 'Modificar',
                ariaLabel: "Modificar usuario proveedor id " + usuarioProveedor.id,
                clase: 'btn-success',
                icono: 'fa-edit',
                accion: () =>
                    this.modificarUsuarioProveedor(
                        usuarioAgrupado,
                        usuarioProveedor
                    ),
            });

            acciones.push({
                nombre: 'Eliminar',
                ariaLabel: "Eliminar usuario proveedor id " + usuarioProveedor.id,
                clase: 'btn-danger',
                icono: 'fa-trash',
                accion: () =>
                    this.eliminarUsuarioProveedor(
                        usuarioAgrupado,
                        usuarioProveedor
                    ),
            });
        }
        return acciones;
    }

    modificarUsuarioProveedor(
        usuarioAgrupado: UsuarioAgrupadoDTO,
        usuarioProveedor: UsuarioProveedorDTO
    ): void {
        const empresa = usuarioProveedor.proveedor;

        const datosIniciales: DatosInicialesModificarDTO = {
            idUsuario: usuarioAgrupado.idUsuario ?? '',
            nombre: usuarioAgrupado.nombre ?? '',
            correo: usuarioProveedor.correo ?? '',
            proveedor: empresa?.id ?? '',
            fechaNombreConfirmado: usuarioAgrupado.fechaNombreConfirmado,
            tipoDocumentoProveedor: empresa?.tipoDocumento ?? '',
            nroDocumentoProveedor: empresa?.nroDocumento ?? '',
            paisDocumentoProveedor: empresa?.paisDocumento?.id ?? '',
            pais:
                this.paises.find(
                    (p) => p.descripcion === usuarioAgrupado.paisDoc
                )?.id ?? '',
            tipoDoc:
                this.tiposDocumentoGeneral.find(
                    (t) => t.descripcion === usuarioAgrupado.tipoDoc
                )?.idTipoDocumento ?? '',
            nroDoc: usuarioAgrupado.idUsuario?.split('-')[2] ?? '',
        };

        this.abrirPopupModificar(datosIniciales);
    }

    vincularEmpresa(usuario: UsuarioAgrupadoDTO): void {
        this.abrirVinculoEmpresaPopup(usuario);
    }

    abrirAgregarPersonaPopup(): void {
        this.actualizarService.mensajeOcultar();

        const comp = this.abrirPopup(
            AgregarModificarProveedorPopupComponent
        ) as AgregarModificarProveedorPopupComponent;

        comp.guardarEvento.subscribe((dto: UsuarioProveedorGuardarDTO) =>
            this.guardarUsuario(dto, undefined, comp)
        );
    }

    abrirPopupModificar(datos?: DatosInicialesModificarDTO): void {
        this.actualizarService.mensajeOcultar();

        const comp = this.abrirPopup(AgregarModificarProveedorPopupComponent, 'Agregar usuario',
            {
                initialState: {
                    datosIniciales: datos,
                },
            }
        ) as AgregarModificarProveedorPopupComponent;
        comp.guardarEvento.subscribe((d) => this.guardarUsuario(d, datos, comp));
    }

    guardarUsuario(
        dto: UsuarioProveedorGuardarDTO,
        datosIniciales?: DatosInicialesModificarDTO,
        popupComponent?: AgregarModificarProveedorPopupComponent
    ): void {
        this.actualizarService.capturarErrores = false;
        if (datosIniciales) {
            if (dto.proveedor.paisDocumento && dto.proveedor.tipoDocumento && dto.proveedor.nroDocumento) {
                this.usuarioProveedorService.actualizarUsuarioProveedor(
                    dto.id.toLowerCase(),
                    dto.proveedor.paisDocumento?.id ?? '',
                    dto.proveedor.tipoDocumento,
                    dto.proveedor.nroDocumento,
                    dto
                ).subscribe({
                    next: () => {
                        this.cerrarPopup();
                        setTimeout(() => {
                            this.actualizarService.mensajeOcultar();
                            setTimeout(() => {
                                this.actualizarService.mensajeCorrecto('El usuario ha sido actualizado de forma exitosa.');
                            }, 100);
                        });
                        this.buscar();
                    },
                    error: (error) => {
                        if (popupComponent) {
                            popupComponent.mostrarError(error, 'Error al actualizar el usuario.');
                        }
                    },
                });
            }
        } else {
            this.usuarioProveedorService.guardarUsuarioProveedor(dto).subscribe({
                next: () => {
                    this.actualizarService.mensajeCorrecto('El usuario ha sido agregado de forma exitosa.');
                    this.cerrarPopup();
                    this.buscar();
                },
                error: (error) => {
                    if (popupComponent) {
                        popupComponent.mostrarError(error, 'Error al guardar el usuario.');
                    }
                },
            });
        }
    }

    abrirVinculoEmpresaPopup(usuario: UsuarioAgrupadoDTO): void {
        const comp = this.abrirPopup(VincularEmpresaPopupComponent, 'Vincular proveedor',
            {
                initialState: {
                    datosIniciales: usuario,
                },
            }
        ) as VincularEmpresaPopupComponent;

        comp.guardarEvento.subscribe((dto: UsuarioProveedorGuardarDTO) => {
            this.actualizarService.mensajeCorrecto('El vínculo con la empresa ha sido agregado de forma exitosa.');
            this.buscar();
        });
    }

    private agruparUsuarios(
        datos: UsuarioProveedorDTO[]
    ): UsuarioAgrupadoDTO[] {
        const map = new Map<string, UsuarioAgrupadoDTO>();
        datos.forEach((dto) => {
            const key = `${dto.pais?.id}-${dto.tipoDocumento?.idTipoDocumento}-${dto.nroDocumento}`.toUpperCase();

            if (!map.has(key)) {
                map.set(key, {
                    documentoFormateado: (dto.pais?.id === Pais.URUGUAY && dto.tipoDocumento?.idTipoDocumento === TipoDocumentoUsuario.CEDULA_IDENTIDAD) ? formatearCI(dto.nroDocumento) : (dto.nroDocumento??''),
                    idUsuario: key,
                    nombre: dto.nombre ?? '',
                    paisDoc: dto.pais?.descripcion,
                    tipoDoc: dto.tipoDocumento?.descripcion,
                    fechaNombreConfirmado: dto.fechaNombreConfirmado,
                    usuarioProveedores: [],
                });
            }
            if (dto.proveedor?.nombre) {
                map.get(key)!.usuarioProveedores.push(dto);
            }
        });

        return Array.from(map.values());
    }

    mostrarAccionVinculo(): boolean {
        return this.seguridad.obtenerTipoUsuario() === TipoUsuario.PROVEEDOR && this.seguridad.obtenerProveedores().length > 1;
    }
}
