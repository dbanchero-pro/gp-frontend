import { DatePipe } from "@angular/common";
import { Pipe } from "@angular/core";

@Pipe({
  name: 'fechaPipe', pure: false
})
export class FechaPipe extends DatePipe {
  format: string | undefined;
  protected defaultFormat: string = 'dd/MM/yyyy';
  protected isoFormat: string = 'yyyy-MM-dd';

  public constructor() {
    super("es-UY");
  }

  public override transform(value: any): any {
    if (this.format) {
      return this.transformFormat(value);
    }
    return super.transform(value, this.defaultFormat);
  }
  public transformGuion(value: any): any {
    if (this.format) {
      return this.transformFormat(value);
    }
    return super.transform(value, this.isoFormat);
  }

  private transformFormat(value: any): any {
    return super.transform(value, this.format);
  }
}
