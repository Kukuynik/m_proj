(function(){
  // перехват ссылок с data-link для SPA-навигации (и обычных ссылок в шапке)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (!href.startsWith('#/')) return; // пропускаем внешние/обычные ссылки
    e.preventDefault();
    // Просто ставим hash — роутер слушает hashchange
    location.hash = href.slice(1); // "#/train" -> "/train"
  });
})();