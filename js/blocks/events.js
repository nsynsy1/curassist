// Раздел 7.2 — мероприятия нелегальных структур.

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
