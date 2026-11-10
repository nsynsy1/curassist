// Данные хранятся в localStorage, как и раньше, но теперь в зашифрованном виде:
// { v: 2, iv, ct }. Старые открытые данные читаются и шифруются при первом входе.

const STORAGE_KEY = 'curator_assistant_data';

const Storage = {
  _timer: null,
  _pending: null,

  _raw() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  _isBox(obj) {
    return obj && obj.v === 2 && typeof obj.iv === 'string' && typeof obj.ct === 'string';
  },

  // Возвращает состояние или null, если данных ещё нет.
  // Бросает ошибку, если данные есть, но прочитать их не удалось — чтобы не затереть их пустыми.
  async load() {
    const stored = this._raw();
    if (!stored) return null;

    if (this._isBox(stored)) {
      return JSON.parse(await Vault.decrypt(Auth.key, stored));
    }

    // Открытые данные старого формата
    await this.save(stored);
    return stored;
  },

  async save(data) {
    try {
      const box = await Vault.encrypt(Auth.key, JSON.stringify(data));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 2, ...box }));
      return true;
    } catch (e) {
      console.error('[Storage] Ошибка сохранения:', e);
      return false;
    }
  },

  // Миграция: шифрует уже существующие открытые данные
  async encryptExisting() {
    const stored = this._raw();
    if (stored && !this._isBox(stored)) await this.save(stored);
  },

  clear() { localStorage.removeItem(STORAGE_KEY); },

  saveDebounced(data, cb) {
    clearTimeout(this._timer);
    this._pending = { data, cb };
    this._timer = setTimeout(() => this.flush(), 350);
  },

  // Отбрасывает отложенное сохранение (когда состояние заменяется целиком)
  cancelPending() {
    clearTimeout(this._timer);
    this._pending = null;
  },

  // Немедленно записывает отложенное сохранение (перед выходом и сбросом)
  async flush() {
    clearTimeout(this._timer);
    const job = this._pending;
    this._pending = null;
    if (!job) return;
    const ok = await this.save(job.data);
    if (job.cb) job.cb(ok);
  }
};
