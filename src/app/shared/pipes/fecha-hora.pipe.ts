import { Pipe } from "@angular/core";
import { FechaPipe } from "./fecha.pipe";

@Pipe({
  
    standalone: true,
name: 'fechaHoraPipe', pure: false
})
export class FechaHoraPipe extends FechaPipe {

  public constructor() {
    super();
    this.defaultFormat = 'dd/MM/yyyy HH:mm:ss';
    this.isoFormat = 'yyyy-MM-dd HH:mm:ss';
  }

}
