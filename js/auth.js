// Пароль не хранится: из него выводится ключ шифрования данных.
// Правильность пароля проверяется расшифровкой контрольной строки.

const AUTH_KEY         = 'ca_auth_v2';        // { v, salt, iter, check:{iv,ct} }
const AUTH_LEGACY_HASH = 'ca_auth_hash';      // старый формат: SHA-256 без соли
const AUTH_SESSION_KEY = 'ca_auth_session_key';
const AUTH_CHECK_TEXT  = 'curassist';

const Auth = {
  key: null, // CryptoKey, живёт только в памяти страницы

  _readV2() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; }
  },

  async legacyHash(password) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  },

  hasPassword() {
    return !!this._readV2() || !!localStorage.getItem(AUTH_LEGACY_HASH);
  },

  async setPassword(password) {
    const salt = Vault.randomB64(16);
    const key = await Vault.deriveKey(password, salt, Vault.ITERATIONS);
    const check = await Vault.encrypt(key, AUTH_CHECK_TEXT);
    localStorage.setItem(AUTH_KEY, JSON.stringify({
      v: 2, salt, iter: Vault.ITERATIONS, check
    }));
    this.key = key;
  },

  async verify(password) {
    const v2 = this._readV2();

    if (v2) {
      try {
        const key = await Vault.deriveKey(password, v2.salt, v2.iter);
        const ok = (await Vault.decrypt(key, v2.check)) === AUTH_CHECK_TEXT;
        if (ok) this.key = key;
        return ok;
      } catch {
        return false; // неверный пароль: расшифровка не прошла
      }
    }

    // Миграция со старой версии: проверяем старый хэш, затем переводим на шифрование
    const legacy = localStorage.getItem(AUTH_LEGACY_HASH);
    if (!legacy || legacy !== await this.legacyHash(password)) return false;

    await this.setPassword(password);
    await Storage.encryptExisting();
    localStorage.removeItem(AUTH_LEGACY_HASH);
    return true;
  },

  async login() {
    sessionStorage.setItem(AUTH_SESSION_KEY, await Vault.exportKey(this.key));
  },

  // Восстановление входа после перезагрузки страницы в той же вкладке
  async restoreSession() {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
    const v2 = this._readV2();
    if (!raw || !v2) return false;
    try {
      const key = await Vault.importKey(raw);
      if ((await Vault.decrypt(key, v2.check)) !== AUTH_CHECK_TEXT) return false;
      this.key = key;
      return true;
    } catch {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      return false;
    }
  },

  logout() {
    this.key = null;
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  },

  // Полное удаление пароля (используется вместе с очисткой данных)
  wipe() {
    this.logout();
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_LEGACY_HASH);
  }
};
