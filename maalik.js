/*
 * معاليك — الإعدادات المشتركة لكل صفحات الموقع.
 *
 * بكسل ميتا (فيسبوك/إنستغرام):
 *   حالياً نفس بكسل MTM. جمهور معاليك ينفصل في مدير الإعلانات بطريقتين:
 *   1) جمهور مخصص من زوار الموقع: الرابط يحتوي على "mtm-watch-designer" (أو دومين معاليك لاحقاً).
 *   2) أو الحدث المخصص "MaalikVisit" وحدث "Lead" مع brand = maalik.
 *   لو سويت بكسل خاص لمعاليك، بدّل الرقم تحت بس.
 */
var MAALIK_META_PIXEL_ID = '1352485683711703';

(function () {
  if (MAALIK_META_PIXEL_ID) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', MAALIK_META_PIXEL_ID);
    fbq('track', 'PageView');
    fbq('trackCustom', 'MaalikVisit', { brand: 'maalik', page: location.pathname });
  }

  function track(ev, params) {
    if (!window.fbq) return;
    params = params || {};
    params.brand = 'maalik';
    try { fbq('track', ev, params); } catch (e) {}
  }

  // كل تواصل عبر الواتساب أو اتصال يُحسب "Lead"
  window.maalikLead = function (source) { track('Lead', { content_name: source || 'whatsapp' }); };

  // أول تفاعل مع أداة التصميم يُحسب "CustomizeProduct" (مرة وحدة بكل زيارة)
  var customized = false;
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var a = e.target.closest('a[href*="wa.me/"], a[href^="tel:"]');
    if (a) { window.maalikLead(a.href.indexOf('tel:') === 0 ? 'call' : 'whatsapp-link'); return; }
    if (!customized && e.target.closest('#shapes button, #straps button, #dials button')) {
      customized = true;
      track('CustomizeProduct', { content_name: 'maalik-studio' });
    }
  }, true);

  // window.open إلى الواتساب (زر الحجز ونموذج النخلة والناقة)
  var open = window.open;
  window.open = function (url) {
    if (typeof url === 'string' && url.indexOf('wa.me/') > -1) window.maalikLead('whatsapp-booking');
    return open.apply(window, arguments);
  };
})();
