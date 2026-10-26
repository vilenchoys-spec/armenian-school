const tg = window.Telegram && Telegram.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  try { tg.setHeaderColor('#f3ead9'); tg.setBackgroundColor('#f3ead9'); } catch (e) {}
}

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

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

// ---------- уроки ----------
const grid = $('lessons-grid');
for (let n = 1; n <= LESSONS_COUNT; n++) {
  const t = document.createElement('button');
  t.className = 'tile';
  t.innerHTML = `<span class="num">${n}</span><span class="lbl">урок</span>`;
  t.onclick = () => openLesson(n);
  grid.appendChild(t);
}

let renderToken = 0;
async function openLesson(n) {
  const token = ++renderToken;
  $('lesson-title').textContent = `Урок ${n}`;
  $('pdf-pages').innerHTML = '';
  $('pdf-status').textContent = 'Загружаю материал…';
  show('lesson');

  try {
    const pdf = await pdfjsLib.getDocument(`pdf/lesson-${n}.pdf`).promise;
    const scale = Math.min(window.devicePixelRatio || 1, 2) * 1.5;
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      if (token !== renderToken) return;
      const vp = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = vp.width;
      canvas.height = vp.height;
      $('pdf-pages').appendChild(canvas);
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      $('pdf-status').textContent = '';
    }
  } catch (e) {
    if (token === renderToken) $('pdf-status').textContent = 'Материал к этому уроку скоро появится 🌿';
  }
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
