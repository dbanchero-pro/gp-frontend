import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild } from "@angular/core";

@Component({
  selector: 'app-double-scroll',
  templateUrl: './double-scroll.component.html',
  styleUrls: ['./double-scroll.component.scss'],
  standalone: false
})
export class DoubleScrollComponent implements AfterViewInit {

  @ViewChild('wrapper1') wrapper1!: ElementRef<any>;
  @ViewChild('wrapper2') wrapper2!: ElementRef<any>;

  @ViewChild('div1') div1!: ElementRef<any>;
  @ViewChild('div2') div2!: ElementRef<any>;

  constructor(private readonly _r: Renderer2, private readonly _cd: ChangeDetectorRef) {
  }


  ngAfterViewInit() {

    this._cd.detach();

    this._r.setStyle(this.div1.nativeElement, 'width', this.div2.nativeElement.clientWidth + 'px');
    this.wrapper1.nativeElement.onscroll = (e: any) => this.wrapper2.nativeElement.scroll((e.target as HTMLElement).scrollLeft, 0)
    this.wrapper2.nativeElement.onscroll = (e: any) => this.wrapper1.nativeElement.scroll((e.target as HTMLElement).scrollLeft, 0)
    const resizeObserver = new ResizeObserver(entries => {
      for (let _entry of entries) {
        this.onDivSizeChanged();
      }
    });

    resizeObserver.observe(this.div2.nativeElement);
  }
  onDivSizeChanged() {
    let delta = 0;
    if (this.div2.nativeElement.scrollWidth > this.div2.nativeElement.clientWidth) {
      delta = 10;
    }
    this._r.setStyle(this.div1.nativeElement, 'width', this.div2.nativeElement.clientWidth - delta + 'px');
  }

}