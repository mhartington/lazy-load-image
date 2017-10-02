import {
  Component,
  ViewChild,
  Input,
  AfterContentInit,
  OnDestroy,
  ElementRef,
  NgZone
} from '@angular/core';
@Component({
  selector: 'lazy-load-img',
  templateUrl: 'lazy-load-img.html'
})
export class LazyLoadImgComponent implements AfterContentInit, OnDestroy {
  hasLoaded: boolean = false;
  lazySource: string;
  observer: IntersectionObserver;
  _imgSrc;
  @Input()
  get imgSrc() {
    return this._imgSrc;
  }
  set imgSrc(val: string) {
    this._imgSrc = val;
  }
  @ViewChild('lazyImage') lazyImage: ElementRef;
  constructor(public zone: NgZone) { }

  ngAfterContentInit() {
    this.observer = new IntersectionObserver(this.onIntersection.bind(this));
    this.observer.observe(this.lazyImage.nativeElement);
  }

  ngOnDestroy() { 
    this.observer.disconnect()
  }

  onIntersection(entries) {
    if (this.hasLoaded) this.observer.disconnect();
    if (entries[0].intersectionRatio > 0) {
      this.observer.unobserve(entries[0].target);
      this.preload(entries[0].target);
    }
  }

  applyImage(target, src) {
    target.src = src;
  }

  fetchImage(url) {
    return new Promise((resolve, reject) => {
      let image = new Image();
      image.src = url;
      image.onload = resolve();
      image.onerror = reject();
    });
  }

  preload(targetEl) {
    return this.fetchImage(this.imgSrc)
      .then(() => {
        this.applyImage(targetEl, this.imgSrc)
        this.hasLoaded = true;
      });
  }
}
