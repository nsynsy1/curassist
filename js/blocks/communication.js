// Раздел 7.6 — общение с лидерами, игроками и администраторами.

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
