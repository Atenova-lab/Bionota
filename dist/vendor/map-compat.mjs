/*
 * PDF.js 5.6 uses Map.prototype.getOrInsertComputed (ECMAScript 2026).
 * Some Android WebViews and mobile browsers do not implement it yet.
 * Both the document thread and the PDF.js module worker import this small
 * compatibility shim before evaluating PDF.js. No patient data is involved.
 */
if (typeof Map.prototype.getOrInsertComputed !== 'function') {
  Object.defineProperty(Map.prototype, 'getOrInsertComputed', {
    configurable: true,
    writable: true,
    value: function getOrInsertComputed(key, callback) {
      if (this.has(key)) return this.get(key);
      if (typeof callback !== 'function') throw new TypeError('callback must be a function');
      const value = callback(key);
      this.set(key, value);
      return value;
    },
  });
}
