// Проверка заполненности разделов: нужна для бейджей в заголовках
// и предупреждений перед копированием отчёта.

const Audit = (() => {
  const SKIP_KEYS = new Set(['failReason', 'id', 'number']);
  const filled = v => v != null && String(v).trim() !== '';

  function sectionData(id) {
    if (id.startsWith('teamTask')) return appState.teamTasks[parseInt(id.slice(8), 10) - 1];
    return appState[id];
  }

  // records — число записей верхнего уровня; hasData — есть ли хоть что-то внесённое
  function stats(id) {
    const data = sectionData(id);
    if (Array.isArray(data)) return { records: data.length, hasData: data.length > 0 };
    if (!data) return { records: 0, hasData: false };

    let records = 0;
    let hasText = false;
    Object.entries(data).forEach(([key, value]) => {
      if (SKIP_KEYS.has(key)) return;
      if (Array.isArray(value)) records += value.length;
      else if (filled(value)) hasText = true;
    });
    return { records, hasData: records > 0 || hasText };
  }

  function label(section) {
    return section.number ? `${section.number} ${section.title}` : section.title;
  }

  // Возвращает список замечаний (пустой, если всё в порядке)
  function warnings() {
    const out = [];
    SECTIONS.filter(s => !s.noChecklist).forEach(section => {
      const done = !!appState.meta.checklist[section.id];
      const { hasData } = stats(section.id);
      if (done && !hasData) {
        out.push(`${label(section)}: отмечен выполненным, но данных нет`);
      } else if (!done && hasData) {
        out.push(`${label(section)}: данные внесены, но раздел не отмечен — в отчёт он попадёт как невыполненный`);
      }
    });
    return out;
  }

  return { stats, warnings };
})();
