# gp-frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.1.

## Estándares de Desarrollo

### Formato de Fechas

El proyecto utiliza el formato **dd/MM/yyyy** para mostrar todas las fechas.

Para aplicar este formato:

1. **Usar el pipe FechaPipe**: Inyectar el `FechaPipe` en el componente y utilizarlo para transformar las fechas.

```typescript
import { FechaPipe } from "ruta/al/pipe/fecha.pipe";

export class MiComponente {
    private fechaPipe = inject(FechaPipe);

    formatearFecha(fecha: any): string {
        return this.fechaPipe.transform(fecha) || "";
    }
}
```

2. **En la plantilla HTML**: Puedes usar el pipe directamente en la plantilla:

```html
{{ miFecha | fechaPipe }}
```

El `FechaPipe` está configurado por defecto para usar el formato 'dd/MM/yyyy' y el locale 'es-UY'.

**Importante**: Siempre mantener este formato consistente en todo el proyecto para una mejor experiencia de usuario.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change
any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also
use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag
for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out
the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
