/* minimal-tweaks.js
   Cross-page tweak persistence for the minimal multi-page site.
   Reads from localStorage and applies CSS custom properties to <html>.
   Runs synchronously at the top of <head> to prevent flash of default styles.
*/
(function () {
  var KEY = 'minimal-tweaks-v1';

  var DEFAULTS = {
    accent:       'terracotta',   // terracotta | slate | moss | ink
    fontSize:     18,             // px
    avatarShape:  'circle',       // circle | rounded | square
    avatarSize:   120,            // px
    serif:        'source-serif'  // source-serif | fraunces | system
  };

  var ACCENTS = {
    terracotta: { accent: '#b14a2a', deep: '#8c3a1d' },
    slate:      { accent: '#4a5b6d', deep: '#2e3c4d' },
    moss:       { accent: '#5e7045', deep: '#3f5635' },
    ink:        { accent: '#1c1c1c', deep: '#000000' }
  };

  var SERIF_STACKS = {
    'source-serif': '"Source Serif 4", "Iowan Old Style", Cambria, Georgia, serif',
    'fraunces':     '"Fraunces", "Iowan Old Style", Cambria, Georgia, serif',
    'system':       '"Iowan Old Style", "Cambria", Georgia, serif'
  };

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return Object.assign({}, DEFAULTS);
      return Object.assign({}, DEFAULTS, JSON.parse(raw));
    } catch (e) { return Object.assign({}, DEFAULTS); }
  }

  function write(t) {
    try { localStorage.setItem(KEY, JSON.stringify(t)); } catch (e) {}
  }

  function apply(t) {
    var html = document.documentElement;
    var ac = ACCENTS[t.accent] || ACCENTS.terracotta;
    html.style.setProperty('--accent', ac.accent);
    html.style.setProperty('--accent-deep', ac.deep);
    html.style.setProperty('--mt-font-size', t.fontSize + 'px');
    var radii = { circle: '50%', rounded: '14px', square: '4px' };
    html.style.setProperty('--mt-avatar-radius', radii[t.avatarShape] || '50%');
    html.style.setProperty('--mt-avatar-size', t.avatarSize + 'px');
    html.style.setProperty('--mt-serif', SERIF_STACKS[t.serif] || SERIF_STACKS['source-serif']);
  }

  // Apply immediately (this script is in <head>, before stylesheet rules cascade)
  var current = read();
  apply(current);

  // Cross-tab sync: if another tab changes the tweaks, re-apply here.
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) {
      current = read();
      apply(current);
    }
  });

  // Expose API for the Tweaks panel on the home page
  window.MinimalTweaks = {
    DEFAULTS: DEFAULTS,
    ACCENTS: ACCENTS,
    get:   function () { return Object.assign({}, current); },
    set:   function (patch) { current = Object.assign({}, current, patch); apply(current); write(current); },
    reset: function () { current = Object.assign({}, DEFAULTS); apply(current); write(current); }
  };
})();
