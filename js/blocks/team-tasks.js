// Командные задания №1–3.

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
