const STORAGE_KEY = 'curator_assistant_data';

const Storage = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('[Storage] Ошибка загрузки:', e);
      return null;
    }
  },

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('[Storage] Ошибка сохранения:', e);
      return false;
    }
  },

  clear() { localStorage.removeItem(STORAGE_KEY); },

  _timer: null,

  saveDebounced(data, cb) {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      const ok = this.save(data);
      if (cb) cb(ok);
    }, 350);
  }
};