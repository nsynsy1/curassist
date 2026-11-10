// Переключатель светлой и тёмной темы. Начальная тема ставится скриптом в <head>.
// Выбор запоминается в localStorage (это настройка вида, а не данные отчёта).

const Theme = {
  KEY: 'ca_theme',

  stored() {
    try {
      const t = localStorage.getItem(this.KEY);
      return t === 'light' || t === 'dark' ? t : null;
    } catch { return null; }
  },

  current() {
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  },

  apply(theme) {
    document.documentElement.dataset.theme = theme;
  },

  toggle() {
    const next = this.current() === 'dark' ? 'light' : 'dark';
    this.apply(next);
    try { localStorage.setItem(this.KEY, next); } catch { /* режим без хранилища */ }
  }
};

// Пока выбор не сделан вручную, тема следует за системной
if (window.matchMedia) {
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    if (!Theme.stored()) Theme.apply(e.matches ? 'light' : 'dark');
  });
}

document.addEventListener('click', e => {
  if (e.target.closest('[data-action="theme"]')) Theme.toggle();
});
