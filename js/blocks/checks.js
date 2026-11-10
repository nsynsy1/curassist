// Разделы 7.8 и 7.10 — одинаковые по структуре списки проверок.

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
