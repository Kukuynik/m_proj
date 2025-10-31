(function () {
  // ——— Читаемый генератор ———
  const COMMON_WORDS = [
    'это','как','что','тот','она','он','они','мы','вы','я','уже','еще','есть','мне','только','очень','можно','сейчас',
    'если','когда','тогда','тут','там','здесь','нужно','надо','должен','после','перед','через','между','потому','лишь',
    'раз','два','разве','ли','кто','где','куда','откуда','зачем','почему','так','такой','сам','каждый','все','ничего',
    'хорошо','плохо','лучше','быстро','медленно','время','день','ночь','год','разный','новый','старый','маленький','большой',
    'дом','город','место','люди','работа','слово','дело','рука','жизнь','голос','мысль','глаз','дорога','мир','сторона',
    'сила','вид','номер','форма','уровень','часть','право','точно','почти','всегда','иногда','часто','сразу','снова'
  ];

  function makeSentence(words, minWords=6, maxWords=12) {
    const len = minWords + Math.floor(Math.random()*(maxWords-minWords+1));
    const arr = [];
    for (let i=0;i<len;i++) arr.push(words[Math.floor(Math.random()*words.length)]);
    const commaCount = Math.random() < 0.4 ? 1 : (Math.random() < 0.15 ? 2 : 0);
    for (let c=0;c<commaCount;c++) {
      const pos = 2 + Math.floor(Math.random()*(arr.length-4));
      arr[pos] = arr[pos] + ',';
    }
    let s = arr.join(' ');
    s = s.charAt(0).toUpperCase() + s.slice(1);
    const end = Math.random() < 0.1 ? '!' : (Math.random() < 0.2 ? '?' : '.');
    return s + end;
  }

  const LETTERS_HOME = 'фывапролджэйцукенгшщзхъячсмитьбю'.split('');
  function makeLetterStream(len=200) {
    let s = '';
    let w = '';
    while (s.length < len) {
      const next = LETTERS_HOME[Math.floor(Math.random()*LETTERS_HOME.length)];
      w += next;
      if (w.length >= 3 + Math.floor(Math.random()*5)) {
        s += (s ? ' ' : '') + w;
        w = '';
      }
    }
    return s.slice(0,len);
  }

  // opts: { length: number, mode: 'readable'|'letters' }
  function genText(length = 250, opts = { mode: 'readable' }) {
    if (opts.mode === 'letters') return makeLetterStream(length);
    const buf = [];
    while (buf.join(' ').length < length) {
      buf.push(makeSentence(COMMON_WORDS,
        6 + Math.floor(Math.random()*3),
        11 + Math.floor(Math.random()*4)
      ));
    }
    let text = buf.join(' ');
    if (text.length > length) {
      const cut = Math.max(
        text.lastIndexOf('.', length),
        text.lastIndexOf('!', length),
        text.lastIndexOf('?', length)
      );
      text = cut > 0 ? text.slice(0, cut+1) : text.slice(0, length);
    }
    return text;
  }

  function renderText(target, pos, errors) {
    const pre = target.slice(0, pos);
    const cur = target[pos] || '';
    const post = target.slice(pos+1);
    const err = errors.has(pos);
    return `
      <span class="text-ok">${pre.replace(/</g,'&lt;')}</span>
      ${cur ? `<span class="${err?'text-err':'text-caret'}">${cur === ' ' ? '·' : cur}</span>` : ''}
      <span>${post.replace(/</g,'&lt;').replace(/ /g,'&nbsp;')}</span>
    `;
  }

  window.TrainPage = function TrainPage() {
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="row">
        <div class="col card">
          <div class="row">
            <div class="col">
              <label class="label">Длина текста</label>
              <select id="len" class="select">
                <option value="150">Короткий</option>
                <option value="250" selected>Средний</option>
                <option value="400">Длинный</option>
              </select>
            </div>
            <div class="col">
              <label class="label">Тип текста</label>
              <select id="mode" class="select">
                <option value="readable" selected>Читаемый</option>
                <option value="letters">Буквенные цепочки</option>
              </select>
            </div>
            <div class="col">
              <label class="label">Управление</label>
              <div style="display:flex; gap:8px;">
                <button id="gen" class="btn">Сгенерировать</button>
                <button id="reset" class="btn secondary">Сброс</button>
              </div>
            </div>
          </div>

          <div id="target" class="text-target" tabindex="0"></div>

          <div class="row" style="margin-top:12px;">
            <div class="col">
              <div class="label">Прогресс</div>
              <div class="progress"><span id="bar"></span></div>
            </div>
            <div class="col">
              <div class="label">Скорость</div>
              <div class="kpi"><span id="wpm">0</span> WPM</div>
            </div>
            <div class="col">
              <div class="label">Точность</div>
              <div class="kpi"><span id="acc">100</span>%</div>
            </div>
          </div>
        </div>
      </div>

      <div id="result" class="card" style="display:none; margin-top:16px;"></div>
    `;

    const lenSel = root.querySelector('#len');
    const modeSel = root.querySelector('#mode');
    const targetEl = root.querySelector('#target');
    const barEl = root.querySelector('#bar');
    const wpmEl = root.querySelector('#wpm');
    const accEl = root.querySelector('#acc');
    const resultEl = root.querySelector('#result');

    let target = genText(Number(lenSel.value), { mode: modeSel.value });
    let typed = '';
    let pos = 0;
    let errors = new Set();
    let startedAt = 0;
    let finishedAt = 0;
    let timer = null;

    function draw() {
      targetEl.innerHTML = renderText(target, pos, errors);
      const progress = Math.min(100, Math.round((pos / target.length) * 100));
      barEl.style.width = progress + '%';
      const now = finishedAt || Date.now();
      const wpm = window.Utils.computeWPM(typed.length, (startedAt ? now - startedAt : 0));
      const acc = window.Utils.computeAccuracy(target.slice(0, typed.length), typed);
      wpmEl.textContent = String(wpm);
      accEl.textContent = isFinite(acc) ? String(acc) : '100';
    }

    function finish() {
      finishedAt = Date.now();
      clearInterval(timer); timer = null;
      targetEl.setAttribute('contenteditable', 'false');
      targetEl.blur();

      const ms = finishedAt - startedAt;
      const wpm = window.Utils.computeWPM(typed.length, ms);
      const acc = window.Utils.computeAccuracy(target.slice(0, typed.length), typed);
      resultEl.style.display = '';
      resultEl.innerHTML = `
        <div class="row" style="align-items:center;">
          <div class="col">
            <div class="kpi">${Math.round(wpm)} WPM</div>
            <div class="small">Скорость</div>
          </div>
          <div class="col">
            <div class="kpi">${Math.round(acc)}%</div>
            <div class="small">Точность</div>
          </div>
          <div class="col">
            <div class="kpi">${(ms/1000).toFixed(1)} c</div>
            <div class="small">Время</div>
          </div>
          <div class="col" style="display:flex; gap:8px; justify-content:flex-end;">
            <button id="new" class="btn">Новый текст</button>
            <button id="again" class="btn secondary">Повторить</button>
          </div>
        </div>
      `;
      resultEl.querySelector('#new').onclick = () => {
        reset(genText(Number(lenSel.value), { mode: modeSel.value }));
      };
      resultEl.querySelector('#again').onclick = () => {
        reset(target);
      };
    }

    function reset(newText = null) {
      if (newText) target = newText;
      typed = '';
      pos = 0;
      errors = new Set();
      startedAt = 0;
      finishedAt = 0;
      clearInterval(timer); timer = null;
      resultEl.style.display = 'none';
      targetEl.setAttribute('contenteditable', 'true');
      draw();
      targetEl.focus();
    }

    root.querySelector('#gen').onclick = () => {
      const nt = genText(Number(lenSel.value), { mode: modeSel.value });
      reset(nt);
    };
    root.querySelector('#reset').onclick = () => reset(target);
    lenSel.onchange = () => {
      target = genText(Number(lenSel.value), { mode: modeSel.value });
      reset(target);
    };
    modeSel.onchange = () => {
      target = genText(Number(lenSel.value), { mode: modeSel.value });
      reset(target);
    };

    targetEl.onkeydown = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); finish(); return; }
      if (e.key === 'Escape') { e.preventDefault(); reset(target); return; }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp' || (e.ctrlKey && e.key.toLowerCase()==='a')) {
        e.preventDefault(); return;
      }
      if (!startedAt) {
        startedAt = Date.now();
        timer = setInterval(draw, 200);
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (pos > 0) {
          pos--;
          typed = typed.slice(0, -1);
          errors.delete(pos);
          draw();
        }
        return;
      }
      if (e.key.length === 1) {
        e.preventDefault();
        const ch = e.key;
        const expected = target[pos] || '';
        typed += ch;
        if (ch !== expected) errors.add(pos);
        pos++;
        if (pos >= target.length) {
          draw();
          finish();
        } else {
          draw();
        }
        return;
      }
    };

    draw();
    setTimeout(() => targetEl.focus(), 0);
    return root;
  };
})();