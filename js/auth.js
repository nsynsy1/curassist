const AUTH_HASH_KEY    = 'ca_auth_hash';
const AUTH_SESSION_KEY = 'ca_auth_session';

const Auth = {
  async hash(password) {
    const buf = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(password)
    );
    return [...new Uint8Array(buf)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  hasPassword() { return !!localStorage.getItem(AUTH_HASH_KEY); },

  async setPassword(p) {
    localStorage.setItem(AUTH_HASH_KEY, await this.hash(p));
  },

  async verify(p) {
    const stored = localStorage.getItem(AUTH_HASH_KEY);
    if (!stored) return false;
    return stored === await this.hash(p);
  },

  isLoggedIn() { return sessionStorage.getItem(AUTH_SESSION_KEY) === '1'; },
  login()      { sessionStorage.setItem(AUTH_SESSION_KEY, '1'); },
  logout()     { sessionStorage.removeItem(AUTH_SESSION_KEY); }
};