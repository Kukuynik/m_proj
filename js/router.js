(function(){
  // перехват ссылок с data-link для SPA-навигации (и обычных ссылок в шапке)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-link], a[href^="/"], a[href^="#/"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('http')) return; // внешние ссылки не перехватываем
    e.preventDefault();
    if (href.startsWith('/')) {
      location.hash = href;
    } else {
      location.hash = '/' + href.replace(/^#?\//,'');
    }
  });
})();