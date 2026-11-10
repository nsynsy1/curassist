// Общие помощники форм: поля, селекты, шапка карточки записи.

function formFieldRow(label, path, value, options = {}) {
  const type = options.type || 'text';
  const attrs = [
    options.min != null ? `min="${options.min}"` : '',
    options.max != null ? `max="${options.max}"` : ''
  ].join(' ');

  const labelHtml = label ? `<label>${esc(label)}</label>` : '';

  if (type === 'textarea') {
    return `
      <div class="form-field">
        ${labelHtml}
        <textarea data-path="${path}">${esc(value || '')}</textarea>
      </div>`;
  }

  return `
    <div class="form-field">
      ${labelHtml}
      <input type="${type}" data-path="${path}" value="${esc(value ?? '')}" ${attrs}>
    </div>`;
}

function formSelectRow(label, path, value, options) {
  const opts = options.map(o => {
    const val = typeof o === 'string' ? o : o.value;
    const lab = typeof o === 'string' ? o : o.label;
    const sel = val === value ? 'selected' : '';
    return `<option value="${esc(val)}" ${sel}>${esc(lab)}</option>`;
  }).join('');

  return `
    <div class="form-field">
      <label>${esc(label)}</label>
      <select data-path="${path}">${opts}</select>
    </div>`;
}

function recordCardHeader(title, index, deletePath, deleteLabel) {
  const indexHtml = index ? `<span class="record-card-index">${esc(index)}</span>` : '';
  return `
    <div class="record-card-header">
      <div class="record-card-title">${esc(title)}${indexHtml}</div>
      <div class="record-card-actions">
        <button class="button-dup" data-action="duplicate" data-path="${deletePath}" title="Создать копию записи">Дублировать</button>
        <button class="button-remove" data-action="delete" data-path="${deletePath}" data-label="${esc(deleteLabel)}" title="Удалить" aria-label="Удалить">✕</button>
      </div>
    </div>`;
}

function failReasonField(path, value) {
  return `
    <div class="form-field" style="margin-top:16px">
      <label>Причина невыполнения</label>
      <input data-path="${path}" value="${esc(value || '')}">
    </div>`;
}
