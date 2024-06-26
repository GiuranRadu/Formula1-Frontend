import { Component, ElementRef, HostListener, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  @ViewChildren('section') sections: QueryList<ElementRef>;

  constructor(private renderer: Renderer2) { }


  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY;

    this.sections.forEach((sec: ElementRef) => {
      const offset = sec.nativeElement.offsetTop - 200;
      const height = sec.nativeElement.offsetHeight;

      if (scrollY >= offset && scrollY < offset + height) {
        this.renderer.addClass(sec.nativeElement, 'show-animate');
      } else {
        this.renderer.removeClass(sec.nativeElement, 'show-animate');
      }
    });
  }


}
