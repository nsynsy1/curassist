function formFieldRow(label, path, value, options = {}) {
  const type = options.type || 'text';
  const attrs = [
    options.min != null ? `min="${options.min}"` : '',
    options.max != null ? `max="${options.max}"` : ''
  ].join(' ');

  const labelHtml = label ? `<label>${esc(label)}</label>` : '';

  if (type === 'textarea') {
    return `
      <div class="form-field">
        ${labelHtml}
        <textarea data-path="${path}">${esc(value || '')}</textarea>
      </div>`;
  }

  return `
    <div class="form-field">
      ${labelHtml}
      <input type="${type}" data-path="${path}" value="${esc(value ?? '')}" ${attrs}>
    </div>`;
}

function formSelectRow(label, path, value, options) {
  const opts = options.map(o => {
    const val = typeof o === 'string' ? o : o.value;
    const lab = typeof o === 'string' ? o : o.label;
    const sel = val === value ? 'selected' : '';
    return `<option value="${esc(val)}" ${sel}>${esc(lab)}</option>`;
  }).join('');

  return `
    <div class="form-field">
      <label>${esc(label)}</label>
      <select data-path="${path}">${opts}</select>
    </div>`;
}

function recordCardHeader(title, index, deletePath, deleteLabel) {
  const indexHtml = index ? `<span class="record-card-index">${esc(index)}</span>` : '';
  return `
    <div class="record-card-header">
      <div class="record-card-title">${esc(title)}${indexHtml}</div>
      <button class="button-remove" data-action="delete" data-path="${deletePath}" data-label="${esc(deleteLabel)}" title="Удалить">✕</button>
    </div>`;
}

function failReasonField(path, value) {
  return `
    <div class="form-field" style="margin-top:16px">
      <label>Причина невыполнения</label>
      <input data-path="${path}" value="${esc(value || '')}">
    </div>`;
}

function renderGovernmentOrgsCheck() {
  const s = appState.governmentOrgsCheck;
  let html = '';

  if (!s.checks.length) {
    html += `<div class="empty-state">Данные не внесены</div>`;
  } else {
    s.checks.forEach((c, ci) => {
      html += `<div class="record-card">
        ${recordCardHeader('Проверка организаций', `№${ci + 1}`, `governmentOrgsCheck.checks.${ci}`, `проверку организаций №${ci + 1}`)}
        <div class="form-row">
          <div class="form-row-fixed w-180">${formFieldRow('Дата', `governmentOrgsCheck.checks.${ci}.date`, c.date, { type: 'date' })}</div>
          <div>${formFieldRow('Ссылка на видео', `governmentOrgsCheck.checks.${ci}.videoLink`, c.videoLink)}</div>
          <div class="form-row-fixed w-150">${formFieldRow('Таймкод', `governmentOrgsCheck.checks.${ci}.timecode`, c.timecode)}</div>
        </div>
        <div class="subsection-title">Организации</div>`;

      if (!c.orgs || !c.orgs.length) {
        html += `<div class="empty-state">Данные не внесены</div>`;
      } else {
        c.orgs.forEach((o, oi) => {
          html += `<div class="record-subcard">
            ${recordCardHeader('Организация', `№${oi + 1}`, `governmentOrgsCheck.checks.${ci}.orgs.${oi}`, `организацию №${oi + 1}`)}
            <div class="form-row">
              <div>${formFieldRow('Название', `governmentOrgsCheck.checks.${ci}.orgs.${oi}.name`, o.name)}</div>
              <div class="form-row-fixed w-140">${formFieldRow('Сотрудники', `governmentOrgsCheck.checks.${ci}.orgs.${oi}.members`, o.members, { type: 'number', min: 0 })}</div>
              <div class="form-row-fixed w-190">${formFieldRow('Сотрудники вне рабочего места', `governmentOrgsCheck.checks.${ci}.orgs.${oi}.offDuty`, o.offDuty, { type: 'number', min: 0 })}</div>
            </div>
            ${formSelectRow('Вердикт', `governmentOrgsCheck.checks.${ci}.orgs.${oi}.verdict`, o.verdict, ['', ...ORGANIZATION_VERDICTS])}
            ${formFieldRow('Комментарий', `governmentOrgsCheck.checks.${ci}.orgs.${oi}.comment`, o.comment, { type: 'textarea' })}
          </div>`;
        });
      }

      html += `<button class="button-add" data-action="add" data-target="governmentOrgsCheck.checks.${ci}.orgs">+ Добавить организацию</button>
      </div>`;
    });
  }

  html += `<button class="button-add" data-action="add" data-target="governmentOrgsCheck.checks">+ Добавить проверку</button>`;
  html += `<div class="summary" id="government-summary">${renderGovernmentSummaryHTML()}</div>`;

  html += `<div class="subsection-title">Беседы с лидерами</div>`;
  if (!s.leadersTalks.length) {
    html += `<div class="empty-state">Данные не внесены</div>`;
  } else {
    s.leadersTalks.forEach((t, ti) => {
      html += `<div class="record-subcard">
        ${recordCardHeader('Беседа с лидером', `№${ti + 1}`, `governmentOrgsCheck.leadersTalks.${ti}`, `беседу с лидером №${ti + 1}`)}
        <div class="form-row">
          <div>${formFieldRow('Лидер (ник и должность)', `governmentOrgsCheck.leadersTalks.${ti}.leader`, t.leader)}</div>
          <div>${formFieldRow('Доказательства (ссылка)', `governmentOrgsCheck.leadersTalks.${ti}.evidence`, t.evidence)}</div>
        </div>
        ${formFieldRow('Текст беседы', `governmentOrgsCheck.leadersTalks.${ti}.text`, t.text, { type: 'textarea' })}
      </div>`;
    });
  }
  html += `<button class="button-add" data-action="add" data-target="governmentOrgsCheck.leadersTalks">+ Добавить беседу</button>`;

  html += failReasonField('governmentOrgsCheck.failReason', s.failReason);
  return html;
}

function renderGovernmentSummaryHTML() {
  return `<div class="summary-title">Автоматический расчёт средних значений</div>${calcGovernmentOrgsSummary()}`;
}

function calcGovernmentOrgsSummary() {
  const s = appState.governmentOrgsCheck;
  const orgMap = {};

  s.checks.forEach(c => (c.orgs || []).forEach(o => {
    if (!o.name) return;
    if (!orgMap[o.name]) orgMap[o.name] = { members: [], offDuty: [] };
    orgMap[o.name].members.push(+o.members || 0);
    orgMap[o.name].offDuty.push(+o.offDuty || 0);
  }));

  const keys = Object.keys(orgMap);
  if (!keys.length) {
    return `<div class="summary-empty">Данные не внесены</div>`;
  }

  const rows = keys.map(name => {
    const m = orgMap[name].members;
    const o = orgMap[name].offDuty;
    const avgM = m.reduce((a, b) => a + b, 0) / m.length;
    const avgOff = o.reduce((a, b) => a + b, 0) / o.length;
    const pct = avgM > 0 ? (avgOff / avgM) * 100 : 0;
    return { name, avgM, avgOff, pct };
  });

  const allM = rows.reduce((a, r) => a + r.avgM, 0) / rows.length;
  const allOff = rows.reduce((a, r) => a + r.avgOff, 0) / rows.length;
  const allPct = allM > 0 ? (allOff / allM) * 100 : 0;

  let html = rows.map(r =>
    `<div class="summary-row">• <b>${esc(r.name)}</b>:
     среднее число сотрудников <b>${round1(r.avgM)}</b> |
     среднее число сотрудников вне рабочего места <b>${round1(r.avgOff)}</b> |
     средний процент сотрудников вне рабочего места <b>${round1(r.pct)}%</b></div>`
  ).join('');

  html += `<div class="divider"></div>
    <div class="summary-row">Среднее число сотрудников: <b>${round1(allM)}</b> |
      среднее число сотрудников вне рабочего места: <b>${round1(allOff)}</b> |
      средний процент сотрудников вне рабочего места: <b>${round1(allPct)}%</b></div>`;

  return html;
}

function renderIllegalEventsObservation() {
  const s = appState.illegalEventsObservation;
  let html = '';

  if (!s.events.length) {
    html += `<div class="empty-state">Данные не внесены</div>`;
  } else {
    const counters = {};
    s.events.forEach((e, ei) => {
      counters[e.type] = (counters[e.type] || 0) + 1;
      const num = counters[e.type];
      const t = EVENT_TYPES.find(x => x.value === e.type) || { name: 'мероприятие' };
      const label = `${t.name} №${num}`;

      html += `<div class="record-card">
        ${recordCardHeader('Мероприятие', label, `illegalEventsObservation.events.${ei}`, `мероприятие «${label}»`)}
        <div class="form-row">
          <div>${formSelectRow('Тип', `illegalEventsObservation.events.${ei}.type`, e.type,
            EVENT_TYPES.map(x => ({ value: x.value, label: x.name })))}</div>
          <div class="form-row-fixed w-190">${formFieldRow('Дата', `illegalEventsObservation.events.${ei}.date`, e.date, { type: 'date' })}</div>
          <div class="form-row-fixed w-130">${formFieldRow('Время', `illegalEventsObservation.events.${ei}.time`, e.time)}</div>
        </div>
        <div class="form-row">
          <div>${formFieldRow('Ссылка на видео', `illegalEventsObservation.events.${ei}.videoLink`, e.videoLink)}</div>
          <div class="form-row-fixed w-150">${formFieldRow('Таймкод', `illegalEventsObservation.events.${ei}.timecode`, e.timecode)}</div>
        </div>
        ${formFieldRow('Описание', `illegalEventsObservation.events.${ei}.comment`, e.comment, { type: 'textarea' })}
        <div class="form-row">
          <div>${formFieldRow('Участники', `illegalEventsObservation.events.${ei}.participants`, e.participants)}</div>
          <div>${formFieldRow('Победитель', `illegalEventsObservation.events.${ei}.winner`, e.winner)}</div>
        </div>
        ${formSelectRow('Активность', `illegalEventsObservation.events.${ei}.activity`, e.activity, EVENT_ACTIVITIES)}
      </div>`;
    });
  }

  html += `<div class="action-buttons">`;
  EVENT_TYPES.forEach(t => {
    html += `<button class="button-add" data-action="addEvent" data-type="${t.value}">+ ${t.name}</button>`;
  });
  html += `</div>`;

  html += `<div class="subsection-title">Общий вывод</div>
    ${formFieldRow('', 'illegalEventsObservation.conclusion', s.conclusion, { type: 'textarea' })}`;

  html += failReasonField('illegalEventsObservation.failReason', s.failReason);
  return html;
}

function renderComplaintsReview() {
  const s = appState.complaintsReview;
  const badCount = s.badAnswers.length;
  const ovCount  = s.overdue.length;

  let html = `<div class="form-row">
    <div class="form-row-fixed w-190">${formFieldRow('Дата', 'complaintsReview.date', s.date, { type: 'date' })}</div>
    <div>${formFieldRow('Ссылка на видео проверки', 'complaintsReview.videoLink', s.videoLink)}</div>
    <div class="form-row-fixed w-150">${formFieldRow('Таймкод', 'complaintsReview.timecode', s.timecode)}</div>
  </div>
  <div class="summary">
    <div class="summary-title">Счётчик</div>
    <div class="summary-row">Некачественных ответов: <b>${badCount}</b> | Просроченных жалоб: <b>${ovCount}</b></div>
  </div>`;

  html += `<div class="subsection-title">Некачественные ответы</div>`;
  if (!s.badAnswers.length) {
    html += `<div class="empty-state">Данные не внесены</div>`;
  } else {
    s.badAnswers.forEach((b, bi) => {
      html += `<div class="record-subcard">
        ${recordCardHeader('Ответ', `№${bi + 1}`, `complaintsReview.badAnswers.${bi}`, `некачественный ответ №${bi + 1}`)}
        ${formSelectRow('Раздел', `complaintsReview.badAnswers.${bi}.section`, b.section, ['', ...COMPLAINT_SECTIONS])}
        ${formFieldRow('Ссылка на жалобу', `complaintsReview.badAnswers.${bi}.link`, b.link)}
        ${formFieldRow('Описание проблемы', `complaintsReview.badAnswers.${bi}.description`, b.description, { type: 'textarea' })}
      </div>`;
    });
  }
  html += `<button class="button-add" data-action="add" data-target="complaintsReview.badAnswers">+ Добавить некачественный ответ</button>`;

  html += `<div class="subsection-title">Просроченные жалобы</div>`;
  if (!s.overdue.length) {
    html += `<div class="empty-state">Данные не внесены</div>`;
  } else {
    s.overdue.forEach((o, oi) => {
      html += `<div class="record-subcard">
        ${recordCardHeader('Жалоба', `№${oi + 1}`, `complaintsReview.overdue.${oi}`, `просроченную жалобу №${oi + 1}`)}
        ${formSelectRow('Раздел', `complaintsReview.overdue.${oi}.section`, o.section, ['', ...COMPLAINT_SECTIONS])}
        ${formFieldRow('Ссылка на жалобу', `complaintsReview.overdue.${oi}.link`, o.link)}
        ${formFieldRow('Описание', `complaintsReview.overdue.${oi}.description`, o.description, { type: 'textarea' })}
      </div>`;
    });
  }
  html += `<button class="button-add" data-action="add" data-target="complaintsReview.overdue">+ Добавить просроченную жалобу</button>`;

  html += `<div class="subsection-title">Вывод</div>
    ${formFieldRow('', 'complaintsReview.conclusion', s.conclusion, { type: 'textarea' })}`;

  html += failReasonField('complaintsReview.failReason', s.failReason);
  return html;
}

function renderCallsConduct() {
  const s = appState.callsConduct;
  let html = '';

  if (!s.calls.length) {
    html += `<div class="empty-state">Данные не внесены</div>`;
  } else {
    s.calls.forEach((c, ci) => {
      html += `<div class="record-card">
        ${recordCardHeader('Обзвон', `№${ci + 1}`, `callsConduct.calls.${ci}`, `обзвон №${ci + 1}`)}
        <div class="form-row">
          <div class="form-row-fixed w-190">${formFieldRow('Дата', `callsConduct.calls.${ci}.date`, c.date, { type: 'date' })}</div>
          <div>${formFieldRow('Ссылка на видео', `callsConduct.calls.${ci}.videoLink`, c.videoLink)}</div>
          <div class="form-row-fixed w-150">${formFieldRow('Таймкод', `callsConduct.calls.${ci}.timecode`, c.timecode)}</div>
        </div>
        ${formFieldRow('Описание', `callsConduct.calls.${ci}.description`, c.description, { type: 'textarea' })}
      </div>`;
    });
  }

  html += `<button class="button-add" data-action="add" data-target="callsConduct.calls">+ Добавить обзвон</button>`;
  html += failReasonField('callsConduct.failReason', s.failReason);
  return html;
}

function renderAdminsWorkControl() {
  const s = appState.adminsWorkControl;
  let html = '';

  if (!s.tasks.length) {
    html += `<div class="empty-state">Данные не внесены</div>`;
  } else {
    s.tasks.forEach((t, ti) => {
      html += `<div class="record-card">
        ${recordCardHeader('Задание', `№${ti + 1}`, `adminsWorkControl.tasks.${ti}`, `задание №${ti + 1}`)}
        <div class="form-row">
          <div class="form-row-fixed w-190">${formFieldRow('Дата', `adminsWorkControl.tasks.${ti}.date`, t.date, { type: 'date' })}</div>
          <div>${formFieldRow('Кому выдано', `adminsWorkControl.tasks.${ti}.assignee`, t.assignee)}</div>
        </div>
        ${formFieldRow('Текст задания', `adminsWorkControl.tasks.${ti}.text`, t.text, { type: 'textarea' })}
        ${formSelectRow('Статус', `adminsWorkControl.tasks.${ti}.status`, t.status, TASK_STATUS_OPTIONS)}
        ${formFieldRow('Комментарий к статусу', `adminsWorkControl.tasks.${ti}.comment`, t.comment, { type: 'textarea' })}
        <div class="form-row">
          <div>${formFieldRow('Видеодоказательства (ссылка)', `adminsWorkControl.tasks.${ti}.evidence`, t.evidence)}</div>
          <div class="form-row-fixed w-150">${formFieldRow('Таймкод', `adminsWorkControl.tasks.${ti}.evidenceTimecode`, t.evidenceTimecode)}</div>
        </div>
      </div>`;
    });
  }
  html += `<button class="button-add" data-action="add" data-target="adminsWorkControl.tasks">+ Добавить задание</button>`;

  html += `<div class="subsection-title">Вывод</div>
    ${formFieldRow('', 'adminsWorkControl.conclusion', s.conclusion, { type: 'textarea' })}`;

  html += failReasonField('adminsWorkControl.failReason', s.failReason);
  return html;
}

function renderCommunicationRecords() {
  const s = appState.communicationRecords;
  let html = '';

  if (!s.records.length) {
    html += `<div class="empty-state">Данные не внесены</div>`;
  } else {
    s.records.forEach((r, ri) => {
      html += `<div class="record-card">
        ${recordCardHeader('Запись', `№${ri + 1}`, `communicationRecords.records.${ri}`, `запись №${ri + 1}`)}
        <div class="form-row">
          <div class="form-row-fixed w-180">${formFieldRow('Дата', `communicationRecords.records.${ri}.date`, r.date, { type: 'date' })}</div>
          <div>${formFieldRow('Описание (заголовок)', `communicationRecords.records.${ri}.description`, r.description)}</div>
        </div>
        <div class="form-row">
          <div>${formFieldRow('Ссылка на видео', `communicationRecords.records.${ri}.link`, r.link)}</div>
          <div class="form-row-fixed w-150">${formFieldRow('Таймкод', `communicationRecords.records.${ri}.timecode`, r.timecode)}</div>
        </div>
        ${formFieldRow('Детали', `communicationRecords.records.${ri}.details`, r.details, { type: 'textarea' })}
      </div>`;
    });
  }
  html += `<button class="button-add" data-action="add" data-target="communicationRecords.records">+ Добавить запись</button>`;
  html += failReasonField('communicationRecords.failReason', s.failReason);
  return html;
}

function renderMappingCheck() {
  const s = appState.mappingCheck;
  let html = '';

  if (!s.checks.length) {
    html += `<div class="empty-state">Данные не внесены</div>`;
  } else {
    s.checks.forEach((c, ci) => {
      html += `<div class="record-card">
        ${recordCardHeader('Проверка', `№${ci + 1}`, `mappingCheck.checks.${ci}`, `проверку №${ci + 1}`)}
        ${formFieldRow('Описание', `mappingCheck.checks.${ci}.description`, c.description, { type: 'textarea' })}
        <div class="form-row">
          <div>${formFieldRow('Ссылка на видео', `mappingCheck.checks.${ci}.videoLink`, c.videoLink)}</div>
          <div class="form-row-fixed w-150">${formFieldRow('Таймкод', `mappingCheck.checks.${ci}.timecode`, c.timecode)}</div>
        </div>
      </div>`;
    });
  }
  html += `<button class="button-add" data-action="add" data-target="mappingCheck.checks">+ Добавить проверку</button>`;

  html += `<div class="subsection-title">Делегирование</div>
    ${formFieldRow('Делегирование задания', 'mappingCheck.delegation', s.delegation)}`;

  html += `<div class="subsection-title">Общий вывод</div>
    ${formFieldRow('', 'mappingCheck.conclusion', s.conclusion, { type: 'textarea' })}`;

  html += failReasonField('mappingCheck.failReason', s.failReason);
  return html;
}

function renderChecksSection(sectionId) {
  const s = appState[sectionId];
  let html = '';

  if (!s.checks.length) {
    html += `<div class="empty-state">Данные не внесены</div>`;
  } else {
    s.checks.forEach((c, ci) => {
      html += `<div class="record-card">
        ${recordCardHeader('Проверка', `№${ci + 1}`, `${sectionId}.checks.${ci}`, `проверку №${ci + 1}`)}
        <div class="form-row">
          <div class="form-row-fixed w-180">${formFieldRow('Дата', `${sectionId}.checks.${ci}.date`, c.date, { type: 'date' })}</div>
          <div>${formFieldRow('Описание', `${sectionId}.checks.${ci}.description`, c.description)}</div>
        </div>
        <div class="form-row">
          <div>${formFieldRow('Ссылка на видео', `${sectionId}.checks.${ci}.videoLink`, c.videoLink)}</div>
          <div class="form-row-fixed w-150">${formFieldRow('Таймкод', `${sectionId}.checks.${ci}.timecode`, c.timecode)}</div>
        </div>
        ${formFieldRow('Комментарий', `${sectionId}.checks.${ci}.comment`, c.comment, { type: 'textarea' })}
        ${formFieldRow('Ссылка на таблицу', `${sectionId}.checks.${ci}.tableLink`, c.tableLink)}
      </div>`;
    });
  }
  html += `<button class="button-add" data-action="add" data-target="${sectionId}.checks">+ Добавить проверку</button>`;

  html += `<div class="subsection-title">Общий вывод</div>
    ${formFieldRow('', `${sectionId}.conclusion`, s.conclusion, { type: 'textarea' })}`;

  html += failReasonField(`${sectionId}.failReason`, s.failReason);
  return html;
}

function renderTopHousesLogs() { return renderChecksSection('topHousesLogs'); }
function renderApartmentsLogsCheck() { return renderChecksSection('apartmentsLogsCheck'); }

function renderAdminsLogsCheck() {
  const s = appState.adminsLogsCheck;
  let html = '';

  html += `<div class="form-row">
    <div class="form-row-fixed w-190">${formFieldRow('Дата', 'adminsLogsCheck.date', s.date, { type: 'date' })}</div>
    <div>${formFieldRow('Описание', 'adminsLogsCheck.description', s.description)}</div>
  </div>
  <div class="form-row">
    <div>${formFieldRow('Ссылка на видео', 'adminsLogsCheck.videoLink', s.videoLink)}</div>
    <div class="form-row-fixed w-150">${formFieldRow('Таймкод', 'adminsLogsCheck.timecode', s.timecode)}</div>
  </div>
  ${formFieldRow('Детали', 'adminsLogsCheck.details', s.details, { type: 'textarea' })}
  ${formFieldRow('Ссылка на таблицу', 'adminsLogsCheck.tableLink', s.tableLink)}
  ${formFieldRow('Вывод', 'adminsLogsCheck.conclusion', s.conclusion, { type: 'textarea' })}`;

  html += failReasonField('adminsLogsCheck.failReason', s.failReason);
  return html;
}

function renderTeamTask(idx) {
  const t = appState.teamTasks[idx];
  let html = `<div class="subsection-title">Записи</div>`;

  if (!t.records.length) {
    html += `<div class="empty-state">Данные не внесены</div>`;
  } else {
    t.records.forEach((r, ri) => {
      html += `<div class="record-subcard">
        ${recordCardHeader('Запись', `№${ri + 1}`, `teamTasks.${idx}.records.${ri}`, `запись №${ri + 1} командного задания`)}
        <div class="form-row">
          <div class="form-row-fixed w-190">${formFieldRow('Дата', `teamTasks.${idx}.records.${ri}.date`, r.date, { type: 'date' })}</div>
          <div>${formFieldRow('Описание', `teamTasks.${idx}.records.${ri}.description`, r.description)}</div>
        </div>
        <div class="form-row">
          <div>${formFieldRow('Ссылка', `teamTasks.${idx}.records.${ri}.link`, r.link)}</div>
          <div class="form-row-fixed w-150">${formFieldRow('Таймкод', `teamTasks.${idx}.records.${ri}.timecode`, r.timecode)}</div>
        </div>
        ${formFieldRow('Содержимое', `teamTasks.${idx}.records.${ri}.details`, r.details, { type: 'textarea' })}
      </div>`;
    });
  }

  html += `<button class="button-add" data-action="add" data-target="teamTasks.${idx}.records">+ Добавить запись</button>`;

  html += `<div class="subsection-title">Вывод</div>
    ${formFieldRow('', `teamTasks.${idx}.conclusion`, t.conclusion, { type: 'textarea' })}`;

  return html;
}

function renderWeeklyStreams() {
  const s = appState.weeklyStreams;
  let html = '';

  if (!s.length) {
    html += `<div class="empty-state">Данные не внесены</div>`;
  } else {
    s.forEach((st, si) => {
      html += `<div class="record-card">
        ${recordCardHeader('Стрим', `№${si + 1}`, `weeklyStreams.${si}`, `стрим №${si + 1}`)}
        <div class="form-row">
          <div>${formSelectRow('День недели', `weeklyStreams.${si}.day`, st.day, WEEK_DAYS)}</div>
          <div>${formFieldRow('Ссылка', `weeklyStreams.${si}.link`, st.link)}</div>
        </div>
        <div class="form-row">
          <div class="form-row-fixed w-110">${formFieldRow('Часы', `weeklyStreams.${si}.hours`, st.hours, { type: 'number', min: 0 })}</div>
          <div class="form-row-fixed w-110">${formFieldRow('Минуты', `weeklyStreams.${si}.minutes`, st.minutes, { type: 'number', min: 0, max: 59 })}</div>
          <div class="form-row-fixed w-110">${formFieldRow('Секунды', `weeklyStreams.${si}.seconds`, st.seconds, { type: 'number', min: 0, max: 59 })}</div>
          <div class="w-full">${formFieldRow('Примечание', `weeklyStreams.${si}.note`, st.note)}</div>
        </div>
      </div>`;
    });
  }

  html += `<button class="button-add" data-action="add" data-target="weeklyStreams">+ Добавить стрим</button>`;
  return html;
}

const SECTION_RENDERERS = {
  governmentOrgsCheck:     renderGovernmentOrgsCheck,
  illegalEventsObservation: renderIllegalEventsObservation,
  complaintsReview:        renderComplaintsReview,
  callsConduct:            renderCallsConduct,
  adminsWorkControl:       renderAdminsWorkControl,
  communicationRecords:    renderCommunicationRecords,
  mappingCheck:            renderMappingCheck,
  topHousesLogs:           renderTopHousesLogs,
  adminsLogsCheck:         renderAdminsLogsCheck,
  apartmentsLogsCheck:     renderApartmentsLogsCheck,
  teamTask1:               () => renderTeamTask(0),
  teamTask2:               () => renderTeamTask(1),
  teamTask3:               () => renderTeamTask(2),
  weeklyStreams:           renderWeeklyStreams
};

function renderSectionBody(sectionId) {
  const fn = SECTION_RENDERERS[sectionId];
  if (!fn) {
    console.warn(`[renderSectionBody] Рендер для секции «${sectionId}» не найден.`);
    return '';
  }
  return fn();
}