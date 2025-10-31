// Простой hash-роутер и общие утилиты
const routes = {
  '/': window.HomePage,
  '/train': window.TrainPage,
  '/race': window.RacePage,
  '/stats': window.StatsPage,
  '/settings': window.SettingsPage,
  '/about': window.AboutPage,
};

const appEl = document.getElementById('app');
document.getElementById('year').textContent = String(new Date().getFullYear());

function render() {
  const path = location.hash.replace('#', '') || '/';
  const page = routes[path] || window.HomePage;
  appEl.innerHTML = '';
  const el = page();
  if (el instanceof HTMLElement) appEl.appendChild(el);
  else if (typeof el === 'string') appEl.innerHTML = el;
}

window.addEventListener('hashchange', render);
window.addEventListener('load', () => {
  render();
  // Тема
  const stored = localStorage.getItem('theme') || 'dark';
  setTheme(stored);
  document.getElementById('themeToggle').onclick = () => {
    const cur = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(cur);
  };
});

function setTheme(mode) {
  document.documentElement.dataset.theme = mode;
  if (mode === 'light') {
    document.documentElement.style.setProperty('--bg','#fafafa');
    document.documentElement.style.setProperty('--surface','#ffffff');
    document.documentElement.style.setProperty('--fg','#111827');
    document.documentElement.style.setProperty('--muted','#6b7280');
    document.documentElement.style.setProperty('--border','#e5e7eb');
  } else {
    document.documentElement.style.setProperty('--bg','#0f1115');
    document.documentElement.style.setProperty('--surface','#12141a');
    document.documentElement.style.setProperty('--fg','#e6e7e8');
    document.documentElement.style.setProperty('--muted','#9aa0a6');
    document.documentElement.style.setProperty('--border','#23262b');
  }
  localStorage.setItem('theme', mode);
}

// Утилиты для времени/метрик
window.Utils = {
  computeWPM(chars, ms) {
    if (ms <= 0) return 0;
    const minutes = ms / 60000;
    return Math.round(((chars / 5) / minutes) * 10) / 10;
  },
  computeAccuracy(target, typed) {
    const len = Math.max(target.length, typed.length);
    let correct = 0;
    for (let i = 0; i < len; i++) if (target[i] === typed[i]) correct++;
    return Math.round((correct / len) * 1000) / 10;
  },
  el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
};