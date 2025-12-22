import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { IColumnaOrden } from '../../../../../../shared/models/common/columna-orden.model';
import { IPuntoRecepcionDTO } from '../../../models/punto-recepcion.model';
import { PuntosRecepcionService } from '../../../services/puntosRecepcion.service';

@Component({
  selector: 'app-responsables-punto-recepcion',
  templateUrl: './responsables-punto-recepcion.component.html',
  styleUrls: ['./responsables-punto-recepcion.component.scss'],
  standalone: false
})
export class ResponsablesPuntoRecepcionComponent extends PaginaBusquedaComponent<IPuntoRecepcionDTO> implements OnInit {
  override nuevaConsulta(): void {
    throw new Error('Method not implemented.');
  }
  override descargarExcel(): void {
    throw new Error('Method not implemented.');
  }
  puntoRecepcion!: IPuntoRecepcionDTO;
  funcionarios: any[] = [];
  idPuntoRecepcion!: number;


  listaOrden: IColumnaOrden[] = [
    { id: 'usuario.nombre', nombre: 'Nombre' },
    { id: 'usuario.nroDocumento', nombre: 'Cédula de identidad' },
    { id: 'correo', nombre: 'Correos' }
  ];

  ordenInicial: 'asc' | 'desc' = 'asc';
  columnaOrdenInicial: string = 'usuario.nombre';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly puntoRecepcionService: PuntosRecepcionService
  ) { super(); }

  override ngOnInit(): void {
    super.ngOnInit();
    this.route.params.subscribe(params => {
      this.idPuntoRecepcion = +params['idPC'];
      if (this.idPuntoRecepcion) {
        this.obtenerPuntoRecepcion();
        this.buscar();
      }
    });
  }

  buscar(): void {
    const params = {
      page: this.parametros.pagina,
      size: this.parametros.tamanoPagina,
      sort: `${this.parametros.sort},${this.parametros.order}`,
      filtros: {
        idPuntoRecepcion: this.idPuntoRecepcion,
      }
    };

    this.puntoRecepcionService.obtenerResponsablesPuntoRecepcion(this.idPuntoRecepcion, params.page, params.size, params.sort).subscribe({
      next: (res: any) => {
        const response = res.content;

        this.funcionarios = response.map((re: any) => ({
          id: re.id,
          nombre: re.nombre,
          nroDocumento: re.nroDocumento,
          correo: re.correo
        }))

        this.total = res.page?.totalElements;
      }
    });
  }


  obtenerPuntoRecepcion() {
    if (this.idPuntoRecepcion) {
      this.puntoRecepcionService.obtenerPuntoRecepcion(this.idPuntoRecepcion).subscribe((res: any) => {
        this.puntoRecepcion = res;
      });
    }
  }

  volver() {
    this.router.navigate(['/administracion/puntos-recepcion'], { queryParams: { volver: 1 } });
  }
}
