import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from '@angular/platform-browser';
@Pipe({
  name: 'safeHtml'
})
export class HtmlSeguroPipe implements PipeTransform {
  constructor(private readonly sanitized: DomSanitizer) { }
  transform(value: any) {
    return this.sanitized.bypassSecurityTrustHtml(value); //NOSONAR
  }
}