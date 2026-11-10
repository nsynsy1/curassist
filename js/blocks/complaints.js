// Раздел 7.3 — проверка разделов жалоб на форуме.

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
