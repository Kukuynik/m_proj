(function(){
  window.HomePage = function HomePage() {
    return `
      <div class="row">
        <div class="col card">
          <h2>TypeSprint</h2>
          <p>Тренируйте слепую печать в читабельном режиме или на буквенных цепочках. Переключайте длину и тип текста, отслеживайте WPM и точность.</p>
          <div style="display:flex; gap:8px; margin-top:8px;">
            <a class="btn" href="#/train">Начать тренировку</a>
            <a class="btn secondary" href="#/about">О проекте</a>
          </div>
        </div>
      </div>
    `;
  };
})();