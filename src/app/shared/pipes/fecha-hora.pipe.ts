import { Pipe } from "@angular/core";
import { FechaPipe } from "./fecha.pipe";

@Pipe({
  name: 'fechaHoraPipe', pure: false,
  standalone: false
})
export class FechaHoraPipe extends FechaPipe {

  public constructor() {
    super();
    this.defaultFormat = 'dd/MM/yyyy HH:mm:ss';
    this.isoFormat = 'yyyy-MM-dd HH:mm:ss';
  }

}
