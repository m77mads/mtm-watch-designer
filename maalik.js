/*
 * معاليك — الإعدادات المشتركة لكل صفحات الموقع.
 *
 * بكسل ميتا (فيسبوك/إنستغرام):
 *   حط رقم البكسل حق معاليك بين علامتي التنصيص تحت، مثال: '123456789012345'
 *   وخلّه فاضي إذا ما تبي البكسل يشتغل.
 *   يفضّل بكسل مستقل عن بكسل MTM حتى تكون جماهير العلامتين منفصلة.
 */
var MAALIK_META_PIXEL_ID = '';

(function () {
  if (MAALIK_META_PIXEL_ID) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', MAALIK_META_PIXEL_ID);
    fbq('track', 'PageView');
  }

  // كل تواصل عبر الواتساب يُحسب "Lead" في البكسل
  window.maalikLead = function (source) {
    if (window.fbq) try { fbq('track', 'Lead', { content_name: source || 'whatsapp' }); } catch (e) {}
  };

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="wa.me/"], a[href^="tel:"]');
    if (a) window.maalikLead(a.href.indexOf('tel:') === 0 ? 'call' : 'whatsapp-link');
  }, true);

  // window.open إلى الواتساب (أزرار التصميم والنماذج)
  var open = window.open;
  window.open = function (url) {
    if (typeof url === 'string' && url.indexOf('wa.me/') > -1) window.maalikLead('whatsapp-form');
    return open.apply(window, arguments);
  };
})();
