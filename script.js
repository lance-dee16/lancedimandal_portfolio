const copyrightYear = document.getElementById('copyright-year');

if (copyrightYear) {
  copyrightYear.textContent = String(new Date().getFullYear());
}
