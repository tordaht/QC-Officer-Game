(function () {
  function coverageTest(manager) {
    const elements = document.querySelectorAll('[data-lang]');
    const missing = new Set();
    elements.forEach(el => {
      const key = el.getAttribute('data-lang');
      const translation = manager.get(key);
      if (translation === key) {
        missing.add(key);
        const badge = document.createElement('span');
        badge.textContent = `⚠ missing:${key}`;
        badge.className = 'missing-translation-badge';
        el.appendChild(badge);
      }
    });
    return Array.from(missing);
  }
  window.coverageTest = coverageTest;
})();
