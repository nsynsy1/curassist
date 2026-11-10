// Шифрование через Web Crypto: ключ из пароля (PBKDF2-SHA256) + AES-GCM-256.
// Всё выполняется локально в браузере, пароль и ключ никуда не отправляются.

const Vault = {
  ITERATIONS: 250000,

  toB64(buf) {
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  },

  fromB64(str) {
    const bin = atob(str);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  },

  randomB64(len) {
    return this.toB64(crypto.getRandomValues(new Uint8Array(len)));
  },

  async deriveKey(password, saltB64, iterations) {
    const material = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: this.fromB64(saltB64), iterations, hash: 'SHA-256' },
      material,
      { name: 'AES-GCM', length: 256 },
      true, // ключ можно выгрузить, чтобы пережить перезагрузку страницы в рамках вкладки
      ['encrypt', 'decrypt']
    );
  },

  async encrypt(key, text) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, key, new TextEncoder().encode(text)
    );
    return { iv: this.toB64(iv), ct: this.toB64(ct) };
  },

  async decrypt(key, box) {
    const buf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: this.fromB64(box.iv) }, key, this.fromB64(box.ct)
    );
    return new TextDecoder().decode(buf);
  },

  async exportKey(key) {
    return this.toB64(await crypto.subtle.exportKey('raw', key));
  },

  importKey(rawB64) {
    return crypto.subtle.importKey(
      'raw', this.fromB64(rawB64), { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']
    );
  }
};
