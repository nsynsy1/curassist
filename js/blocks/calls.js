// Раздел 7.4 — обзвоны.

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
