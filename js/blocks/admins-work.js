// Раздел 7.5 — контроль работы администраторов.

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
