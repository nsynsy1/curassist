const $  = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function toISO(d) { return d.toISOString().slice(0, 10); }

function getCurrentWeek() {
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const mon = new Date(now);
  mon.setDate(now.getDate() - day);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return { start: toISO(mon), end: toISO(sun) };
}

function fmtDateRu(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function fmtDuration(h, m, s) {
  h = parseInt(h) || 0;
  m = parseInt(m) || 0;
  s = parseInt(s) || 0;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function round1(n) { return Math.round(n * 10) / 10; }

function esc(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function setByPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (cur[k] == null) cur[k] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

function getByPath(obj, path) {
  return path.split('.').reduce((c, k) => c?.[k], obj);
}

function ordinal(n) {
  const arr = ['Первая', 'Вторая', 'Третья', 'Четвёртая', 'Пятая',
    'Шестая', 'Седьмая', 'Восьмая', 'Девятая', 'Десятая'];
  return arr[n - 1] || `${n}-я`;
}

let _toastTimer = null;
function toast(msg, type = '') {
  let el = $('#toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.className = 'toast show ' + type;
  el.textContent = msg;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch {
      document.body.removeChild(ta);
      return false;
    }
  }
}

function showConfirm({ title, message, confirmText = 'Подтвердить', danger = true }) {
  return new Promise(resolve => {
    const modal = $('#confirm-modal');
    const okBtn = $('#confirm-ok');
    const cancelBtn = $('#confirm-cancel');

    $('#confirm-title').textContent = title;
    $('#confirm-message').textContent = message;
    okBtn.textContent = confirmText;
    okBtn.className = danger ? 'danger' : 'primary';

    const cleanup = (result) => {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      modal.removeEventListener('click', onBackdrop);
      document.removeEventListener('keydown', onKey);
      resolve(result);
    };

    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);
    const onBackdrop = (e) => { if (e.target === modal) cleanup(false); };
    const onKey = (e) => { if (e.key === 'Escape') cleanup(false); };

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    modal.addEventListener('click', onBackdrop);
    document.addEventListener('keydown', onKey);

    modal.classList.remove('hidden');
    okBtn.focus();
  });
}

function correctWeekRange(startInput, endInput, changed) {
  const start = startInput.value;
  const end = endInput.value;
  if (!start || !end) return null;

  if (changed === 'start' && start > end) {
    endInput.value = start;
    return 'Дата окончания скорректирована';
  }
  if (changed === 'end' && end < start) {
    startInput.value = end;
    return 'Дата начала скорректирована';
  }
  return null;
}