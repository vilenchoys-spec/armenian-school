const tg = window.Telegram && Telegram.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  try { tg.setHeaderColor('#f3ead9'); tg.setBackgroundColor('#f3ead9'); } catch (e) {}
}

const $ = (id) => document.getElementById(id);
const stack = ['home'];

// ---------- навигация ----------
function show(name, push = true) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  $('view-' + name).classList.add('active');
  if (push) stack.push(name);
  window.scrollTo(0, 0);
  if (tg) stack.length > 1 ? tg.BackButton.show() : tg.BackButton.hide();
}

function back() {
  if (stack.length > 1) {
    stack.pop();
    show(stack[stack.length - 1], false);
  }
}

if (tg) tg.BackButton.onClick(back);
document.querySelectorAll('[data-go]').forEach((b) =>
  b.addEventListener('click', () => show(b.dataset.go))
);

// ---------- уроки и задания ----------
function renderList(el, items, label, kind) {
  items.forEach((it) => {
    const row = document.createElement('button');
    row.className = 'lesson' + (it.pdf ? '' : ' soon');
    row.innerHTML =
      `<span class="lesson-num">${it.n}</span>` +
      `<span class="lesson-body"><b>${it.title || label + ' ' + it.n}</b>` +
      `<small>${it.desc || 'Материал скоро появится'}</small></span>` +
      `<span class="chev">›</span>`;
    row.onclick = () => openMaterial(kind, it, label);
    el.appendChild(row);
  });
}
renderList($('lessons-grid'), LESSONS, 'Урок', 'lesson');
renderList($('tasks-list'), TASKS, 'Задание', 'task');

function notify(msg) {
  tg && tg.showAlert ? tg.showAlert(msg) : alert(msg);
}

function absUrl(file) {
  return new URL(`pdf/${file}`, location.href).href;
}

function openFile(url) {
  if (tg && tg.openLink) tg.openLink(url, { try_browser: true });
  else window.open(url, '_blank');
}

function downloadFile(url, name) {
  if (tg && tg.isVersionAtLeast && tg.isVersionAtLeast('8.0') && tg.downloadFile) {
    tg.downloadFile({ url, file_name: name });
  } else {
    openFile(url);
  }
}

function fileButton(icon, title, sub, onclick) {
  const b = document.createElement('button');
  b.className = 'menu-card';
  b.innerHTML =
    `<span class="menu-icon">${icon}</span>` +
    `<span class="menu-text"><b>${title}</b><small>${sub}</small></span>` +
    `<span class="chev">›</span>`;
  b.onclick = onclick;
  return b;
}

function openMaterial(kind, item, label) {
  if (!item.pdf) {
    notify('Материал скоро появится 🌿');
    return;
  }
  const box = $('lesson-files');
  box.innerHTML = '';

  if (item.parts) {
    item.parts.forEach((p, i) => {
      const url = absUrl(p.file);
      const name = `${label} ${item.n} - ${p.title} - Армянский.pdf`;
      const part = document.createElement('div');
      part.className = 'part';
      part.innerHTML =
        `<span class="part-num">${i + 1}</span>` +
        `<div class="part-body"><b>${p.title}</b><small>${p.desc}</small></div>` +
        `<div class="part-actions">` +
        `<button class="btn btn-main">👁 Открыть</button>` +
        `<button class="btn btn-ghost">⬇️ Скачать</button></div>`;
      const [open, dl] = part.querySelectorAll('button');
      open.onclick = () => openFile(url);
      dl.onclick = () => downloadFile(url, name);
      box.appendChild(part);
    });
  } else {
    const url = absUrl(`${kind}-${item.n}.pdf`);
    const name = `${label} ${item.n} - Армянский.pdf`;
    box.appendChild(fileButton('👁', 'Открыть', 'В браузере, можно приближать', () => openFile(url)));
    box.appendChild(fileButton('⬇️', 'Скачать', 'Сохранить PDF на телефон', () => downloadFile(url, name)));
  }
  $('lesson-title').textContent = `${label} ${item.n}`;
  show('lesson');
}

// ---------- карточки ----------
const decksEl = $('decks');
DECKS.forEach((d) => {
  const b = document.createElement('button');
  b.className = 'deck';
  b.innerHTML = `<span><b>${d.title}</b><small>${d.cards.length} слов</small></span><span class="badge">учить</span>`;
  b.onclick = () => openDeck(d);
  decksEl.appendChild(b);
});

let queue = [], current = null, total = 0, known = 0, deckRef = null;

function openDeck(d) {
  deckRef = d;
  $('deck-title').textContent = d.title;
  startDeck();
  show('deck');
}

function startDeck() {
  queue = [...deckRef.cards].sort(() => Math.random() - 0.5);
  total = queue.length;
  known = 0;
  nextCard();
}

function nextCard() {
  $('flip').classList.remove('flipped');
  $('progress-bar').style.width = (total ? (known / total) * 100 : 0) + '%';
  if (!queue.length) {
    current = null;
    $('card-arm').textContent = '🎉';
    $('card-translit').textContent = 'Колода пройдена!';
    $('card-ru').textContent = 'Молодцы';
    $('card-example').textContent = 'Нажми «Перемешать», чтобы повторить';
    $('deck-counter').textContent = `${known} из ${total}`;
    return;
  }
  current = queue[0];
  $('card-arm').textContent = current.arm;
  $('card-translit').textContent = current.translit || '';
  $('card-ru').textContent = current.ru;
  $('card-example').textContent = current.example || '';
  $('deck-counter').textContent = `Выучено ${known} из ${total}`;
}

$('flip').onclick = () => $('flip').classList.toggle('flipped');

$('btn-know').onclick = () => {
  if (!current) return;
  queue.shift();
  known++;
  nextCard();
  tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred('light');
};

$('btn-dont').onclick = () => {
  if (!current) return;
  queue.push(queue.shift());
  nextCard();
};

$('btn-shuffle').onclick = startDeck;
