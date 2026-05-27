/**
 * Mercysweet Foods — app.v8.js
 * Production-hardened: safe SW lifecycle, error tracking,
 * zero layout thrash, passive listeners, idle-loaded analytics.
 */
(function () {
  'use strict';

  /* ── WhatsApp URLs ───────────────────────────────────────── */
  var WA  = 'https://wa.me/2348136440968';
  var MSG = {
    general : 'Hi Mercysweet Foods! I\u2019d like to place an order.',
    tomato  : 'Hi Mercysweet Foods! I\u2019d like to order Natural Tomato Paste. Please share pricing.',
    honey   : 'Hi Mercysweet Foods! I\u2019d like to order Pure Honey. Please share pricing.',
    bulk    : 'Hi Mercysweet Foods! I\u2019m interested in bulk or wholesale orders.',
    partner : 'Hi Mercysweet Foods! I\u2019d like to discuss a distribution or partnership.'
  };
  function waUrl(k) { return WA + '?text=' + encodeURIComponent(MSG[k] || MSG.general); }

  /* ── Error tracking (must be first) ─────────────────────── */
  window.onerror = function (msg, src, line, col, err) {
    if (window.gtag) {
      window.gtag('event', 'js_error', {
        description: (msg || '') + ' @ ' + (src || '') + ':' + line,
        fatal: false
      });
    }
    return false; /* don't suppress default browser logging */
  };

  window.addEventListener('unhandledrejection', function (e) {
    if (window.gtag) {
      window.gtag('event', 'unhandled_rejection', {
        description: e.reason ? String(e.reason).slice(0, 200) : 'unknown',
        fatal: false
      });
    }
  });

  /* ── Year ────────────────────────────────────────────────── */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── Smooth scroll ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var t  = document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth' });
      closeMobileNav();
    });
  });

  /* ── Section offset cache — rebuilt on resize, zero thrash ─ */
  var secs     = Array.from(document.querySelectorAll('section[id]'));
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  var cache    = [];

  function buildCache() {
    var sy = window.scrollY;
    cache = secs.map(function (s) {
      return { id: s.id, top: s.getBoundingClientRect().top + sy };
    });
  }
  buildCache();
  window.addEventListener('resize', buildCache, { passive: true });

  /* ── Scroll — RAF-throttled, fully passive ───────────────── */
  var hdr = document.getElementById('site-header');
  var btt = document.getElementById('back-top');
  var mbar = document.getElementById('mobile-bar');
  var raf  = false;

  if (mbar) {
    mbar.style.cssText =
      'transform:translateY(110%);transition:transform .4s cubic-bezier(.19,1,.22,1)';
  }

  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (hdr)  hdr.classList.toggle('stuck', y > 16);
      if (btt)  btt.classList.toggle('show',  y > 420);
      if (mbar) mbar.style.transform = y < 200 ? 'translateY(110%)' : 'translateY(0)';

      var cur = '';
      for (var i = 0; i < cache.length; i++) {
        if (y >= cache[i].top - 120) cur = cache[i].id;
      }
      navLinks.forEach(function (a) {
        if (a.getAttribute('href') === '#' + cur) {
          a.setAttribute('aria-current', 'page');
        } else {
          a.removeAttribute('aria-current');
        }
      });
      raf = false;
    });
  }, { passive: true });

  /* ── Back to top ─────────────────────────────────────────── */
  if (btt) {
    btt.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Mobile nav ──────────────────────────────────────────── */
  var ham  = document.getElementById('hamburger');
  var mnav = document.getElementById('mobile-nav');

  function closeMobileNav() {
    if (!ham || !mnav) return;
    ham.setAttribute('aria-expanded', 'false');
    mnav.classList.remove('open');
    mnav.setAttribute('aria-hidden', 'true');
  }

  if (ham && mnav) {
    ham.addEventListener('click', function () {
      var open = ham.getAttribute('aria-expanded') === 'true';
      ham.setAttribute('aria-expanded', String(!open));
      mnav.classList.toggle('open', !open);
      mnav.setAttribute('aria-hidden', String(open));
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMobileNav();
  });

  /* ── Scroll reveal ───────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -28px 0px' });
    document.querySelectorAll('.sr').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.sr').forEach(function (el) { el.classList.add('in'); });
  }

  /* ── Hero parallax — GPU-only transform, passive ─────────── */
  var hA = document.querySelector('.hero-img-a');
  var hB = document.querySelector('.hero-img-b');
  if (hA && hB && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < 800) {
        hA.style.transform = 'translateY(calc(-50% + ' + (y * 0.05) + 'px))';
        hB.style.transform = 'translateY(' + (y * -0.035) + 'px)';
      }
    }, { passive: true });
  }

  /* ── FAQ accordion ───────────────────────────────────────── */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    var ans = item.querySelector('.faq-a');
    if (!btn || !ans) return;
    btn.addEventListener('click', function () {
      var open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (o) {
        if (o === item) return;
        o.classList.remove('open');
        var ob = o.querySelector('.faq-q');
        var oa = o.querySelector('.faq-a');
        if (ob) ob.setAttribute('aria-expanded', 'false');
        if (oa) oa.setAttribute('aria-hidden', 'true');
      });
      item.classList.toggle('open', !open);
      btn.setAttribute('aria-expanded', String(!open));
      ans.setAttribute('aria-hidden', String(open));
    });
  });

  /* ── Order form → WhatsApp ───────────────────────────────── */
  var oForm = document.getElementById('order-form');
  var oOk   = document.getElementById('order-success');
  if (oForm && oOk) {
    oForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!oForm.checkValidity()) { oForm.reportValidity(); return; }
      var g = function (id) {
        return ((document.getElementById(id) || {}).value || '').trim();
      };
      var msg = 'Hello Mercysweet Foods!\n\nORDER REQUEST\n'
        + '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n'
        + 'Name: '    + g('o-name')    + '\n'
        + 'Phone: '   + g('o-phone')   + '\n'
        + 'Product: ' + g('o-product') + '\n'
        + (g('o-qty')      ? 'Quantity: '  + g('o-qty')      + '\n' : '')
        + (g('o-location') ? 'Delivery: '  + g('o-location') + '\n' : '')
        + (g('o-notes')    ? 'Notes: '     + g('o-notes')    + '\n' : '');
      window.open(WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
      oForm.style.display = 'none';
      oOk.style.display   = 'block';
    });
  }

  /* ── Contact form ────────────────────────────────────────── */
  var cForm = document.getElementById('contact-form');
  var cOk   = document.getElementById('contact-success');
  if (cForm && cOk) {
    cForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!cForm.checkValidity()) { cForm.reportValidity(); return; }
      cForm.style.display = 'none';
      cOk.style.display   = 'block';
    });
  }

  /* ── Lazy image fade-in ──────────────────────────────────── */
  document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
    if (img.complete) return;
    img.style.opacity    = '0';
    img.style.transition = 'opacity 0.35s ease';
    img.addEventListener('load',  function () { img.style.opacity = '1'; });
    img.addEventListener('error', function () { img.style.opacity = '1'; });
  });

  /* ── data-wa progressive enhancement ─────────────────────── */
  document.querySelectorAll('[data-wa]').forEach(function (el) {
    var url = waUrl(el.getAttribute('data-wa'));
    if (el.tagName === 'A') {
      el.href = url;
    } else {
      el.addEventListener('click', function () {
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    }
  });

  /* ── SW: safe update notification ───────────────────────── */
  function initSW() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(function (reg) {

        /* Listen for a waiting worker (new version available) */
        function onUpdateFound() {
          var newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', function () {
            if (newWorker.state === 'installed' &&
                navigator.serviceWorker.controller) {
              showUpdateBanner(newWorker);
            }
          });
        }

        reg.addEventListener('updatefound', onUpdateFound);

        /* Check for already-waiting worker on page load */
        if (reg.waiting && navigator.serviceWorker.controller) {
          showUpdateBanner(reg.waiting);
        }

        /* Reload page when controller changes (after skip) */
        var refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', function () {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });
      })
      .catch(function () { /* SW is enhancement only — fail silently */ });
  }

  function showUpdateBanner(worker) {
    var banner = document.getElementById('sw-update-banner');
    if (!banner) return;
    banner.hidden = false;
    var btn = document.getElementById('sw-update-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        banner.hidden = true;
        worker.postMessage({ type: 'SKIP_WAITING' });
      });
    }
  }

  /* ── Idle-load: GA4 ──────────────────────────────────────── */
  function loadGA4() {
    var GA4_ID = 'G-XXXXXXXXXX'; /* ← Replace with real Measurement ID */
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, {
      send_page_view: true,
      anonymize_ip: true
    });
    var s = document.createElement('script');
    s.src   = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    s.async = true;
    document.head.appendChild(s);
  }

  /* ── Idle-load: web-vitals CWV ───────────────────────────── */
  function loadWebVitals() {
    var s = document.createElement('script');
    s.src   = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js';
    s.async = true;
    s.addEventListener('load', function () {
      if (!window.webVitals) return;
      var report = function (m) {
        if (window.gtag) {
          window.gtag('event', m.name, {
            event_category: 'Web Vitals',
            value: Math.round(m.name === 'CLS' ? m.value * 1000 : m.value),
            event_label: m.id,
            non_interaction: true
          });
        }
      };
      webVitals.onCLS(report);
      webVitals.onINP(report);
      webVitals.onFCP(report);
      webVitals.onLCP(report);
      webVitals.onTTFB(report);
    });
    document.head.appendChild(s);
  }

  /* ── Idle scheduler ──────────────────────────────────────── */
  function idle(fn, timeout) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(fn, { timeout: timeout || 4000 });
    } else {
      setTimeout(fn, timeout || 2000);
    }
  }

  idle(initSW,       1500);
  idle(loadGA4,      3000);
  idle(loadWebVitals, 4000);

})();
