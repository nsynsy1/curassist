// Резервная копия: экспорт текущей недели в JSON-файл и импорт обратно.
// Файл не зашифрован — его нужно хранить так же аккуратно, как сами отчёты.

const Backup = (() => {
  const FORMAT = 'curassist-backup';

  // Приводит импортированные данные к текущей структуре: недостающие поля берутся из значений по умолчанию
  function mergeDefaults(defaults, incoming) {
    if (Array.isArray(defaults)) return Array.isArray(incoming) ? incoming : defaults;
    if (defaults && typeof defaults === 'object') {
      const src = incoming && typeof incoming === 'object' ? incoming : {};
      const out = { ...src };
      Object.keys(defaults).forEach(k => { out[k] = mergeDefaults(defaults[k], src[k]); });
      return out;
    }
    return incoming === undefined ? defaults : incoming;
  }

  function isValidState(obj) {
    return !!obj && typeof obj === 'object'
      && obj.meta && typeof obj.meta === 'object'
      && obj.meta.checklist && typeof obj.meta.checklist === 'object'
      && Array.isArray(obj.teamTasks);
  }

  function exportToFile(state) {
    const payload = {
      format: FORMAT,
      version: 1,
      exportedAt: new Date().toISOString(),
      data: state
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const day = (state.meta.weekStart || new Date().toISOString().slice(0, 10));
    a.href = url;
    a.download = `curassist-${day}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Возвращает готовое состояние или бросает Error с понятным текстом
  async function readFile(file) {
    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      throw new Error('Файл не похож на JSON');
    }
    const candidate = parsed && parsed.format === FORMAT ? parsed.data : parsed;
    if (!isValidState(candidate)) throw new Error('В файле нет данных CurAssist');
    return mergeDefaults(createDefaultState(), candidate);
  }

  return { exportToFile, readFile };
})();
