// ========== Загрузка книги ==========
async function loadBook() {
  const res = await fetch('book.json');
  if (!res.ok) throw new Error('Не удалось загрузить book.json');
  return await res.json();
}

// ========== Навигация ==========
function renderNav(chapters, activeId) {
  const nav = document.getElementById('nav');
  if (!nav) return;
  nav.innerHTML = '';

  chapters.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'nav-item' + (ch.id === activeId ? ' active' : '');
    btn.dataset.page = ch.id;

    const num = document.createElement('span');
    num.className = 'nav-num';
    num.textContent = String(ch.number).padStart(2, '0');

    const ttl = document.createElement('span');
    ttl.textContent = ch.title;

    btn.appendChild(num);
    btn.appendChild(ttl);
    btn.addEventListener('click', () => {
      switchChapter(ch.id);
      closeSidebar();
    });
    nav.appendChild(btn);
  });
}

// ========== Рендер главы ==========
function renderChapter(chapter) {
  const main = document.getElementById('content');
  if (!main) return;
  main.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'container';

  const header = document.createElement('header');
  header.className = 'chapter-header';

  const numEl = document.createElement('span');
  numEl.className = 'chapter-number';
  numEl.textContent = `ГЛАВА ${chapter.number}`;
  header.appendChild(numEl);

  const title = document.createElement('h1');
  title.className = 'chapter-title';
  title.textContent = chapter.title;
  header.appendChild(title);

  if (chapter.epigraph) {
    const ep = document.createElement('p');
    ep.className = 'chapter-epigraph';
    ep.textContent = chapter.epigraph;
    header.appendChild(ep);
  }
  container.appendChild(header);

  chapter.blocks.forEach(block => {
    const el = renderBlock(block);
    if (el) container.appendChild(el);
  });

  container.appendChild(renderChapterFooter(chapter));

  main.appendChild(container);
  updateProgress(0);
}

// ========== Футер главы ==========
function renderChapterFooter(chapter) {
  const chapters = window.__book.chapters;
  const idx = chapters.findIndex(c => c.id === chapter.id);
  const next = chapters[idx + 1];

  const footer = document.createElement('div');

  if (next) {
    footer.className = 'chapter-footer';

    if (chapter.outro) {
      const outro = document.createElement('p');
      outro.className = 'chapter-outro';
      outro.textContent = chapter.outro;
      footer.appendChild(outro);
    }

    const btn = document.createElement('button');
    btn.className = 'btn-continue';
    btn.innerHTML = `
      <span>ГЛАВА ${next.number}: ${next.title}</span>
      <span class="arrow">▶</span>
    `;
    btn.addEventListener('click', () => goToNextChapter(chapter.id));
    footer.appendChild(btn);
  } else {
    footer.className = 'chapter-finish';

    const icon = document.createElement('span');
    icon.className = 'finish-icon';
    icon.textContent = '📖';
    footer.appendChild(icon);

    const txt = document.createElement('div');
    txt.className = 'finish-text';
    txt.textContent = 'КОНЕЦ КНИГИ';
    footer.appendChild(txt);

    if (chapter.outro) {
      const sub = document.createElement('p');
      sub.className = 'finish-sub';
      sub.textContent = chapter.outro;
      footer.appendChild(sub);
    }
  }

  return footer;
}

function goToNextChapter(currentId) {
  const chapters = window.__book.chapters;
  const idx = chapters.findIndex(c => c.id === currentId);
  const next = chapters[idx + 1];
  if (!next) return;
  switchChapter(next.id);
}

// ========== Фабрика блоков ==========
function renderBlock(block) {
  switch (block.type) {
    case 'p':          return renderParagraph(block);
    case 'dialog':     return renderDialog(block);
    case 'thought':    return renderThought(block);
    case 'scene':      return renderScene(block);
    case 'mc-card':    return renderMcCard(block);
    case 'craft':      return renderCraft(block);
    case 'note':       return renderNote(block);
    case 'warn':       return renderWarn(block);
    case 'book-quote': return renderBookQuote(block);
    case 'whisper':    return renderWhisper(block);
    case 'telepath':   return renderTelepath(block);
    case 'final':      return renderFinal(block);
    default:           return null;
  }
}

function renderParagraph(b) {
  const p = document.createElement('p');
  p.className = 'block-p';
  p.textContent = b.text || '';
  return p;
}

function renderDialog(b) {
  const div = document.createElement('div');
  div.className = 'block-dialog';

  const t = document.createElement('span');
  t.className = 'd-text';
  t.textContent = b.text || '';
  div.appendChild(t);

  if (b.note) {
    const n = document.createElement('span');
    n.className = 'd-note';
    n.textContent = ' ' + b.note;
    div.appendChild(n);
  }
  return div;
}

function renderThought(b) {
  const div = document.createElement('div');
  div.className = 'block-thought';
  div.textContent = b.text || '';
  return div;
}

function renderScene(b) {
  const div = document.createElement('div');
  div.className = 'block-scene';
  div.textContent = b.text || '◆ ◆ ◆';
  return div;
}

// ========== MC CARD ==========
function renderMcCard(b) {
  const card = document.createElement('div');
  card.className = 'mc-card rarity-' + (b.rarity || 'common');

  const icon = document.createElement('div');
  icon.className = 'mc-icon';

  const iconSrc = b.icon || '';
  if (/\.(png|gif|svg|webp)$/i.test(iconSrc)) {
    const img = document.createElement('img');
    img.src = iconSrc;
    img.alt = b.name || '';
    img.loading = 'lazy';
    img.draggable = false;
    icon.appendChild(img);
  } else {
    icon.textContent = iconSrc || '⬛';
  }

  card.appendChild(icon);

  const body = document.createElement('div');
  body.className = 'mc-body';

  const name = document.createElement('div');
  name.className = 'mc-name';
  name.textContent = b.name || '';
  body.appendChild(name);

  if (b.text) {
    const txt = document.createElement('div');
    txt.className = 'mc-text';
    txt.textContent = b.text;
    body.appendChild(txt);
  }

  card.appendChild(body);
  return card;
}

// ========== CRAFT ==========
function renderCraft(b) {
  const box = document.createElement('div');
  box.className = 'craft';

  const title = document.createElement('div');
  title.className = 'craft-title';
  title.textContent = '⚒ ' + (b.title || 'Рецепт');
  box.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'craft-grid';

  (b.ingredients || []).forEach(ing => {
    const slot = document.createElement('div');
    slot.className = 'craft-slot';
    fillCraftSlot(slot, ing);
    grid.appendChild(slot);
  });

  const arrow = document.createElement('div');
  arrow.className = 'craft-arrow';
  arrow.textContent = '➜';
  grid.appendChild(arrow);

  const result = document.createElement('div');
  result.className = 'craft-slot craft-result';
  fillCraftSlot(result, b.result);
  grid.appendChild(result);

  box.appendChild(grid);

  if (b.text) {
    const txt = document.createElement('div');
    txt.className = 'craft-text';
    txt.textContent = b.text;
    box.appendChild(txt);
  }
  return box;
}

// Универсальный заполнитель слота крафта:
//   строка "🪨 Булыжник × 3"                              → просто текст
//   { "icon": "textures/...png", "text": "× 3" }          → <img> + текст
//   { "icon": "textures/...png" }                         → только <img>
//   { "icon": "🪨", "text": "Булыжник" }                  → эмодзи + текст
function fillCraftSlot(slot, value) {
  if (value == null) return;

  if (typeof value === 'object' && value.icon != null) {
    const src = String(value.icon);
    if (/\.(png|gif|svg|webp)$/i.test(src)) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = value.text || '';
      img.draggable = false;
      slot.appendChild(img);
    } else {
      const span = document.createElement('span');
      span.className = 'craft-slot-text';
      span.textContent = src;
      slot.appendChild(span);
    }
    if (value.text) {
      const span = document.createElement('span');
      span.className = 'craft-slot-text';
      span.textContent = (value.icon && !/\.(png|gif|svg|webp)$/i.test(src) ? ' ' : '') + value.text;
      slot.appendChild(span);
    }
    return;
  }

  slot.textContent = String(value);
}

// ========== NOTE / WARN ==========
function renderNote(b) {
  const div = document.createElement('div');
  div.className = 'note';
  div.textContent = b.text || '';
  return div;
}

function renderWarn(b) {
  const div = document.createElement('div');
  div.className = 'warn';
  div.textContent = b.text || '';
  return div;
}

// ========== BOOK QUOTE ==========
function renderBookQuote(b) {
  const div = document.createElement('blockquote');
  div.className = 'block-book-quote';
  div.textContent = b.text || '';
  return div;
}

// ========== WHISPER ==========
function renderWhisper(b) {
  const div = document.createElement('div');
  div.className = 'block-whisper';
  div.textContent = b.text || '';
  return div;
}

// ========== TELEPATH ==========
function renderTelepath(b) {
  const div = document.createElement('div');
  div.className = 'block-telepath';
  div.textContent = b.text || '';
  return div;
}

// ========== FINAL ==========
function renderFinal(b) {
  const div = document.createElement('div');
  div.className = 'block-final';
  div.textContent = b.text || 'КОНЕЦ';
  return div;
}

// ========== Переключение главы ==========
function switchChapter(id, options = {}) {
  document.querySelectorAll('.nav-item').forEach(t => {
    t.classList.toggle('active', t.dataset.page === id);
  });

  const chapter = window.__book.chapters.find(c => c.id === id);
  if (!chapter) return;

  renderChapter(chapter);
  localStorage.setItem('mc-book-last', id);

  if (!options.noScroll) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ========== Sidebar ==========
function openSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('hamburger')?.classList.add('open');
  document.getElementById('overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('hamburger')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}
function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('overlay');
  if (!sidebar || !hamburger || !overlay) return;

  hamburger.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  overlay.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSidebar();
  });
}

// ========== Прогресс ==========
function setupProgress() {
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? Math.min(100, Math.round((window.scrollY / h) * 100)) : 0;
    updateProgress(pct);
  }, { passive: true });
}
function updateProgress(pct) {
  const fill = document.getElementById('progress-fill');
  const text = document.getElementById('progress-text');
  if (fill) fill.style.width = pct + '%';
  if (text) text.textContent = pct + '%';
}

// ========== Клавиши ← → ==========
function setupKeyboardNav() {
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const chapters = window.__book.chapters;
    const activeId = document.querySelector('.nav-item.active')?.dataset.page;
    const idx = chapters.findIndex(c => c.id === activeId);

    if (e.key === 'ArrowRight' && idx < chapters.length - 1) {
      switchChapter(chapters[idx + 1].id);
    }
    if (e.key === 'ArrowLeft' && idx > 0) {
      switchChapter(chapters[idx - 1].id);
    }
  });
}

// ========== Инициализация ==========
async function init() {
  const content = document.getElementById('content');
  if (!content) return;

  try {
    content.innerHTML = '<div class="loading">⛏ Загрузка книги...</div>';

    const data = await loadBook();
    window.__book = data.book ? { ...data.book, chapters: data.chapters } : data;

    if (!window.__book.chapters?.length) throw new Error('В книге нет глав');

    const last = localStorage.getItem('mc-book-last');
    const start = window.__book.chapters.find(c => c.id === last) || window.__book.chapters[0];

    renderNav(window.__book.chapters, start.id);
    renderChapter(start);
    setupSidebar();
    setupProgress();
    setupKeyboardNav();
  } catch (err) {
    content.innerHTML = `
      <div class="error">
        ОШИБКА ЗАГРУЗКИ<br><br>
        ${err.message}<br><br>
        Открой через http://localhost, а не file://
      </div>`;
    console.error(err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}