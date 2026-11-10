// Стримы за неделю.

function renderWeeklyStreams() {
  const s = appState.weeklyStreams;
  let html = '';

  if (!s.length) {
    html += `<div class="empty-state">Данные не внесены</div>`;
  } else {
    s.forEach((st, si) => {
      html += `<div class="record-card">
        ${recordCardHeader('Стрим', `№${si + 1}`, `weeklyStreams.${si}`, `стрим №${si + 1}`)}
        <div class="form-row">
          <div>${formSelectRow('День недели', `weeklyStreams.${si}.day`, st.day, WEEK_DAYS)}</div>
          <div>${formFieldRow('Ссылка', `weeklyStreams.${si}.link`, st.link)}</div>
        </div>
        <div class="form-row">
          <div class="form-row-fixed w-110">${formFieldRow('Часы', `weeklyStreams.${si}.hours`, st.hours, { type: 'number', min: 0 })}</div>
          <div class="form-row-fixed w-110">${formFieldRow('Минуты', `weeklyStreams.${si}.minutes`, st.minutes, { type: 'number', min: 0, max: 59 })}</div>
          <div class="form-row-fixed w-110">${formFieldRow('Секунды', `weeklyStreams.${si}.seconds`, st.seconds, { type: 'number', min: 0, max: 59 })}</div>
          <div class="w-full">${formFieldRow('Примечание', `weeklyStreams.${si}.note`, st.note)}</div>
        </div>
      </div>`;
    });
  }

  html += `<button class="button-add" data-action="add" data-target="weeklyStreams">+ Добавить стрим</button>`;
  return html;
}
