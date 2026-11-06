const copyrightYear = document.getElementById('copyright-year');
if (copyrightYear) copyrightYear.textContent = String(new Date().getFullYear());

/* Graphic design gallery: category filters + full-size viewer.
   Plain JS (no GSAP) so the gallery still works if the animation libraries fail. */
document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.design-card'));
  const filters = Array.from(document.querySelectorAll('.design-filter'));
  const viewer = document.querySelector('.design-lightbox');
  if (!cards.length) return;

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.filter;
      filters.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      cards.forEach((card) => {
        card.hidden = category !== 'all' && card.dataset.category !== category;
      });
      // Layout height changed; let ScrollTrigger re-measure everything below the gallery.
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  });

  if (!viewer || typeof viewer.showModal !== 'function') return;
  const viewerImg = viewer.querySelector('.design-lightbox__img');
  const viewerCaption = viewer.querySelector('.design-lightbox__caption');
  let current = 0;

  const visibleCards = () => cards.filter((card) => !card.hidden);

  function show(card) {
    const list = visibleCards();
    current = Math.max(0, list.indexOf(card));
    const thumb = card.querySelector('.design-card__img');
    viewerImg.src = card.querySelector('.design-card__open').dataset.full;
    viewerImg.alt = thumb.alt;
    viewerCaption.innerHTML = card.querySelector('figcaption').innerHTML;
    viewer.classList.toggle('is-single', list.length < 2);
  }

  function step(delta) {
    const list = visibleCards();
    if (list.length < 2) return;
    show(list[(current + delta + list.length) % list.length]);
  }

  cards.forEach((card) => {
    card.querySelector('.design-card__open').addEventListener('click', () => {
      show(card);
      viewer.showModal();
    });
  });

  viewer.querySelector('.design-lightbox__close').addEventListener('click', () => viewer.close());
  viewer.querySelector('.design-lightbox__nav--prev').addEventListener('click', () => step(-1));
  viewer.querySelector('.design-lightbox__nav--next').addEventListener('click', () => step(1));
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  // Clicking the dim backdrop (the dialog itself, outside the figure and buttons) closes it.
  viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); });
  viewer.addEventListener('close', () => { viewerImg.removeAttribute('src'); });
});
