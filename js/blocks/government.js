// Раздел 7.1 — проверка государственных организаций.

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
