// Раздел 7.9 — логи администраторов.

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
