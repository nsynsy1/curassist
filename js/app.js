let appState = null;
let expandedSections = new Set();

function saveState() {
  const ind = $('#save-indicator');
  ind.textContent = '… Сохранение';
  ind.className = 'save-indicator visible saving';

  appState.meta.lastSaved = new Date().toISOString();

  Storage.saveDebounced(appState, ok => {
    ind.textContent = ok ? '✓ Сохранено' : '⚠ Ошибка сохранения';
    ind.className = 'save-indicator visible';
    if (!ok) ind.style.color = 'var(--danger)';
    setTimeout(() => ind.classList.remove('visible'), 1500);
  });
}

function showAuthScreen() {
  $('#app').classList.add('hidden');
  $('#auth-screen').classList.remove('hidden');

  const setup = !Auth.hasPassword();
  $('#auth-message').textContent = setup
    ? 'Придумайте пароль для доступа'
    : 'Введите пароль';
  $('#auth-confirm-field').classList.toggle('hidden', !setup);
  $('#auth-submit').textContent = setup ? 'Установить пароль' : 'Войти';

  $('#auth-password').value = '';
  $('#auth-password-confirm').value = '';
  $('#auth-password').classList.remove('invalid');
  $('#auth-password-confirm').classList.remove('invalid');
  setTimeout(() => $('#auth-password').focus(), 60);
}

async function submitAuthForm() {
  const passInput = $('#auth-password');
  const confirmInput = $('#auth-password-confirm');
  const pass = passInput.value;
  const confirm = confirmInput.value;

  passInput.classList.remove('invalid');
  confirmInput.classList.remove('invalid');

  if (!pass) {
    passInput.classList.add('invalid');
    toast('Введите пароль', 'error');
    return;
  }

  if (!Auth.hasPassword()) {
    if (pass.length < 4) {
      passInput.classList.add('invalid');
      toast('Пароль должен содержать не менее 4 символов', 'error');
      return;
    }
    if (pass !== confirm) {
      confirmInput.classList.add('invalid');
      toast('Введённые пароли не совпадают', 'error');
      return;
    }
    await Auth.setPassword(pass);
    Auth.login();
    showApplicationScreen();
  } else {
    const ok = await Auth.verify(pass);
    if (!ok) {
      passInput.classList.add('invalid');
      toast('Неверный пароль', 'error');
      return;
    }
    Auth.login();
    showApplicationScreen();
  }
}

function showApplicationScreen() {
  $('#auth-screen').classList.add('hidden');
  $('#app').classList.remove('hidden');

  appState = Storage.load() || createDefaultState();
  expandedSections.clear();

  $('#week-start').value = appState.meta.weekStart;
  $('#week-end').value   = appState.meta.weekEnd;

  renderChecklistEntries();
  renderSections();
  updateProgress();
}

function renderChecklistEntries() {
  const wrap = $('#checklist');
  wrap.innerHTML = '';

  SECTIONS.filter(s => !s.noChecklist).forEach(section => {
    const done = !!appState.meta.checklist[section.id];
    const el = document.createElement('label');
    el.className = 'checklist-entry' + (done ? ' done' : '');
    el.dataset.checklistId = section.id;

    const label = section.number
      ? `${section.number}: ${section.title}`
      : section.title;

    el.innerHTML = `
      <input type="checkbox" data-checklist="${section.id}" ${done ? 'checked' : ''}>
      <span>${done ? '✅' : '❌'} ${esc(label)}</span>`;
    wrap.appendChild(el);
  });
}

function updateProgress() {
  const vals = Object.values(appState.meta.checklist);
  const done = vals.filter(Boolean).length;
  const pct = (done / vals.length) * 100;
  $('#progress-fill').style.width = pct + '%';
  $('#progress-text').textContent = `${done} / ${vals.length}`;
}

function renderSections() {
  const wrap = $('#sections');
  wrap.innerHTML = '';

  SECTIONS.forEach(section => {
    const done = !section.noChecklist && !!appState.meta.checklist[section.id];
    const isOpen = expandedSections.has(section.id);

    const el = document.createElement('div');
    el.className = 'section-item' + (isOpen ? ' open' : '');
    el.dataset.id = section.id;

    const statusHtml = section.noChecklist
      ? ''
      : `<span class="section-status">${done ? '✅' : '❌'}</span>`;

    const titleHtml = section.number
      ? `<span class="section-number">${section.number}:</span> ${esc(section.title)}`
      : esc(section.title);

    el.innerHTML = `
      <div class="section-header">
        <div class="section-header-title">${statusHtml}<span>${titleHtml}</span></div>
        <span class="section-toggle">▶</span>
      </div>
      <div class="section-body">${isOpen ? renderSectionBody(section.id) : ''}</div>`;

    wrap.appendChild(el);
  });
}

function refreshSectionContent(sectionId) {
  const item = document.querySelector(`.section-item[data-id="${sectionId}"]`);
  if (!item) return;
  const body = item.querySelector('.section-body');
  if (!body || !item.classList.contains('open')) return;
  body.innerHTML = renderSectionBody(sectionId);
}

function createRecord(path) {
  const parts = path.split('.');
  const last = parts[parts.length - 1];

  if (path === 'governmentOrgsCheck.checks') {
    return { date: '', videoLink: '', timecode: '', orgs: [] };
  }
  if (last === 'orgs') {
    return { name: '', members: 0, offDuty: 0, verdict: '', comment: '' };
  }
  if (path === 'governmentOrgsCheck.leadersTalks') {
    return { leader: '', text: '', evidence: '' };
  }
  if (path === 'illegalEventsObservation.events') {
    return { type: 'airdrop', date: '', time: '',
      videoLink: '', timecode: '', participants: '', winner: '',
      activity: 'Небольшая', comment: '' };
  }
  if (last === 'badAnswers' || last === 'overdue') {
    return { section: '', link: '', description: '' };
  }
  if (path === 'callsConduct.calls') {
    return { date: '', videoLink: '', timecode: '', description: '' };
  }
  if (path === 'adminsWorkControl.tasks') {
    return { date: '', assignee: '', text: '', status: 'Выполнено',
      comment: '', evidence: '', evidenceTimecode: '' };
  }
  if (path === 'communicationRecords.records') {
    return { date: '', description: '', link: '', timecode: '', details: '' };
  }
  if (path === 'mappingCheck.checks') {
    return { date: '', description: '', videoLink: '', timecode: '' };
  }
  if (path === 'topHousesLogs.checks' || path === 'apartmentsLogsCheck.checks') {
    return { date: '', description: '', videoLink: '', timecode: '',
      comment: '', tableLink: '' };
  }
  if (/^teamTasks\.\d+\.records$/.test(path)) {
    return { date: '', description: '', link: '', timecode: '', details: '' };
  }
  if (path === 'weeklyStreams') {
    return { day: 'Понедельник', link: '', hours: 0, minutes: 0, seconds: 0, note: '' };
  }
  return {};
}

function resolveSectionId(path) {
  const parts = path.split('.');
  if (parts[0] === 'teamTasks') {
    return 'teamTask' + (parseInt(parts[1], 10) + 1);
  }
  return parts[0];
}

function addRecordToSection(path) {
  const arr = getByPath(appState, path);
  if (!Array.isArray(arr)) return;
  arr.push(createRecord(path));

  const sectionId = resolveSectionId(path);
  refreshSectionContent(sectionId);
  saveState();
}

function addEventRecord(type) {
  appState.illegalEventsObservation.events.push({
    type,
    date: '', time: '', videoLink: '', timecode: '',
    participants: '', winner: '', activity: 'Небольшая', comment: ''
  });
  refreshSectionContent('illegalEventsObservation');
  saveState();
}

async function deleteRecordByPath(fullPath, deleteLabel) {
  const label = deleteLabel || 'запись';
  const ok = await showConfirm({
    title: 'Удаление',
    message: `Удалить ${label}?`,
    confirmText: 'Удалить',
    danger: true
  });
  if (!ok) return;

  const parts = fullPath.split('.');
  const idx = parseInt(parts.pop(), 10);
  const parentPath = parts.join('.');
  const arr = getByPath(appState, parentPath);
  if (!Array.isArray(arr)) return;

  arr.splice(idx, 1);

  const sectionId = resolveSectionId(parentPath);
  refreshSectionContent(sectionId);
  saveState();
}

async function resetCurrentWeek() {
  const ok = await showConfirm({
    title: 'Сброс недели',
    message: 'Сбросить данные текущей недели?',
    confirmText: 'Сбросить',
    danger: true
  });
  if (!ok) return;

  const { weekStart, weekEnd } = appState.meta;
  appState = createDefaultState();
  appState.meta.weekStart = weekStart;
  appState.meta.weekEnd = weekEnd;
  Storage.save(appState);
  expandedSections.clear();
  showApplicationScreen();
  toast('Данные текущей недели сброшены', 'success');
}

function openReportPreview() {
  const text = Report.generate(appState);
  $('#preview-content').textContent = text;
  $('#char-count').textContent = 'Символов: ' + text.length.toLocaleString('ru-RU');
  $('#preview-modal').classList.remove('hidden');
}

function closeReportPreview() {
  $('#preview-modal').classList.add('hidden');
}

async function copyReportToClipboard() {
  const text = Report.generate(appState);
  const ok = await copyToClipboard(text);
  toast(ok ? 'Отчёт скопирован в буфер обмена' : 'Не удалось скопировать отчёт',
    ok ? 'success' : 'error');
}

function expandAllSections() {
  SECTIONS.forEach(s => expandedSections.add(s.id));
  renderSections();
}

function collapseAllSections() {
  expandedSections.clear();
  renderSections();
}

async function handleDelegatedClick(e) {
  const removeBtn = e.target.closest('[data-action="delete"]');
  if (removeBtn) {
    e.stopPropagation();
    await deleteRecordByPath(removeBtn.dataset.path, removeBtn.dataset.label);
    return;
  }

  const actionBtn = e.target.closest('[data-action]');
  if (actionBtn) {
    const action = actionBtn.dataset.action;
    if (action === 'add')      addRecordToSection(actionBtn.dataset.target);
    if (action === 'addEvent') addEventRecord(actionBtn.dataset.type);
    return;
  }

  const header = e.target.closest('.section-header');
  if (header) {
    const item = header.parentElement;
    const id = item.dataset.id;
    const opening = !item.classList.contains('open');

    item.classList.toggle('open');
    if (opening) {
      expandedSections.add(id);
      const body = item.querySelector('.section-body');
      if (body) body.innerHTML = renderSectionBody(id);
    } else {
      expandedSections.delete(id);
    }
    return;
  }

  if (e.target.matches('[data-checklist]')) {
    const key = e.target.dataset.checklist;
    appState.meta.checklist[key] = e.target.checked;

    const entry = e.target.closest('.checklist-entry');
    if (entry) entry.classList.toggle('done', e.target.checked);

    const sectionItem = document.querySelector(`.section-item[data-id="${key}"]`);
    if (sectionItem) {
      const status = sectionItem.querySelector('.section-status');
      if (status) status.textContent = e.target.checked ? '✅' : '❌';
    }

    updateProgress();
    saveState();
  }
}

function handleDelegatedInput(e) {
  const el = e.target;
  if (!el.dataset || !el.dataset.path) return;

  let value = el.value;
  if (el.type === 'number') value = value === '' ? '' : Number(value);

  setByPath(appState, el.dataset.path, value);
  saveState();

  if (el.dataset.path.startsWith('governmentOrgsCheck.')) {
    const sum = $('#government-summary');
    if (sum) sum.innerHTML = renderGovernmentSummaryHTML();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  $('#auth-submit').addEventListener('click', submitAuthForm);
  $('#auth-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') submitAuthForm();
  });
  $('#auth-password-confirm').addEventListener('keydown', e => {
    if (e.key === 'Enter') submitAuthForm();
  });

  $('#btn-logout').addEventListener('click', async () => {
    const ok = await showConfirm({
      title: 'Выход из аккаунта',
      message: 'Выйти из аккаунта? Несохранённые изменения будут потеряны.',
      confirmText: 'Выйти',
      danger: true
    });
    if (!ok) return;
    Auth.logout();
    showAuthScreen();
  });

  $('#week-start').addEventListener('change', e => {
    appState.meta.weekStart = e.target.value;
    const msg = correctWeekRange($('#week-start'), $('#week-end'), 'start');
    if (msg) {
      appState.meta.weekEnd = $('#week-end').value;
      toast(msg);
    }
    saveState();
  });
  $('#week-end').addEventListener('change', e => {
    appState.meta.weekEnd = e.target.value;
    const msg = correctWeekRange($('#week-start'), $('#week-end'), 'end');
    if (msg) {
      appState.meta.weekStart = $('#week-start').value;
      toast(msg);
    }
    saveState();
  });

  $('#btn-preview').addEventListener('click', openReportPreview);
  $('#btn-copy').addEventListener('click', copyReportToClipboard);
  $('#btn-reset').addEventListener('click', resetCurrentWeek);

  $('#btn-expand-all').addEventListener('click', expandAllSections);
  $('#btn-collapse-all').addEventListener('click', collapseAllSections);

  $('#modal-close').addEventListener('click', closeReportPreview);
  $('#preview-modal').addEventListener('click', e => {
    if (e.target.id === 'preview-modal') closeReportPreview();
  });
  $('#modal-copy').addEventListener('click', async () => {
    const text = $('#preview-content').textContent;
    const ok = await copyToClipboard(text);
    toast(ok ? 'Отчёт скопирован в буфер обмена' : 'Не удалось скопировать отчёт',
      ok ? 'success' : 'error');
  });

  document.addEventListener('click', handleDelegatedClick);
  document.addEventListener('input', handleDelegatedInput);
  document.addEventListener('change', handleDelegatedInput);

  if (Auth.isLoggedIn()) showApplicationScreen();
  else showAuthScreen();
});