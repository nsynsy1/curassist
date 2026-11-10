// Раздел 7.7 — проверка маппинга.

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
