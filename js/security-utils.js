/** 前端輸出安全工具。 */
window.SafeUI = Object.freeze({
  escape(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  attr(value) {
    return this.escape(value)
      .replace(/`/g, '&#96;')
      .replace(/\r/g, '&#13;')
      .replace(/\n/g, '&#10;');
  },

  studentId(value) {
    const normalized = String(value ?? '').trim();
    return /^\d{6,12}$/.test(normalized) ? normalized : '';
  },

  domId(value) {
    const normalized = String(value ?? '');
    return /^[A-Za-z0-9_-]+$/.test(normalized) ? normalized : '';
  },

  safeExternalUrl(value) {
    try {
      const url = new URL(String(value ?? ''), window.location.origin);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch (e) {
      return '';
    }
  }
});
