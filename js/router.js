(function(){
  // Кликаем только по ссылкам с hash-роутом
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (!href.startsWith('#/')) return; // внешние/обычные ссылки не трогаем
    e.preventDefault();
    // Прямо ставим hash; app.js слушает hashchange и перерендерит
    location.hash = href; // например "#/train"
  });

  // Если пользователь открыл страницу без #, ставим #/ автоматически
  if (!location.hash) location.hash = '#/';
})();