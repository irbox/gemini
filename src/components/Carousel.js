/**
 * Universal Accessible Carousel Component
 * Reconstructed from Chunk 6816 and 8486 in blog.google Webpack bundle
 */

import { BaseComponent } from '../core/BaseComponent.js';
import { isRTL } from '../core/utils.js';
import analyticsDispatcher from '../analytics/AnalyticsDispatcher.js';

export class CarouselComponent extends BaseComponent {
  constructor(element) {
    super(element);
    this.currentIndex = 0;
    this.totalSlides = 0;
    this.isDragging = false;
    this.startX = 0;
    this.scrollLeft = 0;
  }

  _elements() {
    this.ui = {
      ...this.loadElements({
        viewport: '.uni-carousel__viewport, .scrollable-cards-panel-viewport, .uni-carousel-viewport',
        track: '.uni-carousel__track, .uni-carousel-track',
        prevBtn: '.uni-carousel__control--prev, .uni-carousel-control--prev',
        nextBtn: '.uni-carousel__control--next, .uni-carousel-control--next',
        indicator: '.uni-carousel__indicator'
      }),
      slides: this.el.querySelectorAll('.uni-carousel__slide, .uni-flex-card, .uni-carousel-slide')
    };
    this.totalSlides = this.ui.slides.length;
  }

  _events() {
    if (this.ui.prevBtn) {
      this.ui.prevBtn.addEventListener('click', () => this.scrollPrev());
    }

    if (this.ui.nextBtn) {
      this.ui.nextBtn.addEventListener('click', () => this.scrollNext());
    }

    if (this.ui.viewport) {
      // Touch and mouse drag events
      this.ui.viewport.addEventListener('scroll', () => this.updateControlsState());
      this.ui.viewport.addEventListener('keydown', (e) => this.handleKeydown(e));

      // Pointer drag support
      this.ui.viewport.addEventListener('mousedown', (e) => this.startDrag(e));
      window.addEventListener('mousemove', (e) => this.onDrag(e));
      window.addEventListener('mouseup', () => this.stopDrag());

      this.ui.viewport.addEventListener('touchstart', (e) => this.startDragTouch(e), { passive: true });
      this.ui.viewport.addEventListener('touchmove', (e) => this.onDragTouch(e), { passive: true });
      this.ui.viewport.addEventListener('touchend', () => this.stopDrag());
    }

    this.updateControlsState();
  }

  handleKeydown(e) {
    const rtl = isRTL();
    if (e.key === 'ArrowLeft') {
      rtl ? this.scrollNext() : this.scrollPrev();
    } else if (e.key === 'ArrowRight') {
      rtl ? this.scrollPrev() : this.scrollNext();
    }
  }

  scrollPrev() {
    const viewport = this.ui.viewport;
    if (!viewport) return;
    const scrollAmount = viewport.clientWidth * 0.8;
    viewport.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    this.trackNavigation('prev');
  }

  scrollNext() {
    const viewport = this.ui.viewport;
    if (!viewport) return;
    const scrollAmount = viewport.clientWidth * 0.8;
    viewport.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    this.trackNavigation('next');
  }

  updateControlsState() {
    const viewport = this.ui.viewport;
    if (!viewport) return;

    const scrollLeft = viewport.scrollLeft;
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const atStart = scrollLeft <= 5;
    const atEnd = scrollLeft >= maxScroll - 5;

    if (this.ui.prevBtn) {
      this.ui.prevBtn.disabled = atStart;
      this.ui.prevBtn.setAttribute('aria-disabled', String(atStart));
    }

    if (this.ui.nextBtn) {
      this.ui.nextBtn.disabled = atEnd;
      this.ui.nextBtn.setAttribute('aria-disabled', String(atEnd));
    }
  }

  startDrag(e) {
    this.isDragging = true;
    this.startX = e.pageX - this.ui.viewport.offsetLeft;
    this.scrollLeft = this.ui.viewport.scrollLeft;
    this.ui.viewport.style.cursor = 'grabbing';
    this.ui.viewport.style.userSelect = 'none';
  }

  onDrag(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    const x = e.pageX - this.ui.viewport.offsetLeft;
    const walk = (x - this.startX) * 1.5;
    this.ui.viewport.scrollLeft = this.scrollLeft - walk;
  }

  stopDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.ui.viewport) {
      this.ui.viewport.style.cursor = '';
      this.ui.viewport.style.userSelect = '';
    }
  }

  startDragTouch(e) {
    if (e.touches.length === 1) {
      this.startX = e.touches[0].pageX;
      this.scrollLeft = this.ui.viewport.scrollLeft;
    }
  }

  onDragTouch(e) {
    if (e.touches.length === 1) {
      const x = e.touches[0].pageX;
      const walk = (x - this.startX) * 1.2;
      this.ui.viewport.scrollLeft = this.scrollLeft - walk;
    }
  }

  trackNavigation(direction) {
    analyticsDispatcher.dispatch({
      event: 'carousel_navigation',
      category: 'interaction',
      action: 'click',
      label: `Carousel ${direction}`,
      contentType: 'carousel',
      direction
    });
  }
}

export default CarouselComponent;
