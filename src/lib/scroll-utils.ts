/**
 * Scroll to an element using Lenis if available, otherwise native smooth scroll.
 */
export function smoothScrollToElement(el: HTMLElement, offset = -20) {
  const lenis = (window as any).__lenis;
  if (lenis) {
    lenis.scrollTo(el, { duration: 1.2, offset });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

/**
 * Scroll to the booking section, handling mobile offset.
 */
export function scrollToBookingSection() {
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    const mobileHeader = document.getElementById("booking-mobile-header");
    if (mobileHeader) {
      smoothScrollToElement(mobileHeader, -20);
      return;
    }
  }
  const booking = document.getElementById("booking");
  if (booking) {
    smoothScrollToElement(booking);
  }
}
