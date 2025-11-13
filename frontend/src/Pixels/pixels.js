
// // ========================
// // إعدادات البكسل
// // ========================
// window.PIXEL_CONFIG = {
//     FACEBOOK_PIXEL_ID: "",//457635167324683
//     GOOGLE_ANALYTICS_ID: "",//AW-17123499997
//     TIKTOK_PIXEL_ID: "", // GTM-5TXXQ383
//     PINTEREST_TAG_ID: "",
//     SNAPCHAT_PIXEL_ID: "",
//     LINKEDIN_PARTNER_ID: "",
//     TWITTER_PIXEL_ID: "",
//     REDDIT_PIXEL_ID: "",
//     QUORA_PIXEL_ID: "",
// };

// // ========================
// // دالة لود كل البكسلات
// // ========================
// window.loadPixels = function () {
//     const config = window.PIXEL_CONFIG;

//     // --- Facebook Pixel ---
//     !(function (f, b, e, v, n, t, s) {
//         if (f.fbq) return;
//         n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
//         if (!f._fbq) f._fbq = n;
//         n.push = n;
//         n.loaded = !0;
//         n.version = '2.0';
//         n.queue = [];
//         t = b.createElement(e); t.async = !0;
//         t.src = 'https://connect.facebook.net/en_US/fbevents.js';
//         s = b.getElementsByTagName(e)[0];
//         s.parentNode.insertBefore(t, s);
//     })(window, document, 'script');
//     fbq('init', config.FACEBOOK_PIXEL_ID);
//     fbq('track', 'PageView');

//     // --- Google Analytics ---
//     window.dataLayer = window.dataLayer || [];
//     function gtag() { window.dataLayer.push(arguments); }
//     gtag('js', new Date());
//     gtag('config', config.GOOGLE_ANALYTICS_ID);

//     // --- TikTok Pixel ---
//     !(function (w, d, t) {
//         w.TiktokAnalyticsObject = t;
//         var ttq = w[t] = w[t] || [];
//         ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
//         ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
//         for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
//         ttq.load = function (e, n) {
//             var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
//             (ttq._i = ttq._i || {}), (ttq._i[e] = []), (ttq._i[e]._u = i);
//             (ttq._t = ttq._t || {}), (ttq._t[e] = +new Date());
//             (ttq._o = ttq._o || {}), (ttq._o[e] = n || {});
//             var o = d.createElement("script");
//             o.type = "text/javascript"; o.async = !0;
//             o.src = i + "?sdkid=" + e + "&lib=" + t;
//             var a = d.getElementsByTagName("script")[0];
//             a.parentNode.insertBefore(o, a);
//         };
//         ttq.load(config.TIKTOK_PIXEL_ID);
//         ttq.page();
//     })(window, document, 'ttq');

//     // --- Pinterest Pixel ---
//     if (config.PINTEREST_TAG_ID) {
//         !(function (e) {
//             if (!window.pintrk) {
//                 window.pintrk = function () { window.pintrk.queue.push(Array.prototype.slice.call(arguments)) };
//                 var n = window.pintrk; n.queue = []; n.version = "3.0";
//                 var t = document.createElement("script"); t.async = !0; t.src = e;
//                 var r = document.getElementsByTagName("script")[0]; r.parentNode.insertBefore(t, r);
//             }
//         })("https://s.pinimg.com/ct/core.js");
//         pintrk("load", config.PINTEREST_TAG_ID);
//         pintrk("page");
//     }

//     // --- Snapchat Pixel ---
//     if (config.SNAPCHAT_PIXEL_ID) {
//         !(function (e, t, n) {
//             if (e.snaptr) return;
//             var a = e.snaptr = function () { a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments) };
//             a.queue = []; var s = "script"; var r = t.createElement(s); r.async = !0;
//             r.src = "https://sc-static.net/scevent.min.js";
//             var u = t.getElementsByTagName(s)[0]; u.parentNode.insertBefore(r, u);
//         })(window, document);
//         snaptr("init", config.SNAPCHAT_PIXEL_ID);
//     }

//     // --- LinkedIn ---
//     if (config.LINKEDIN_PARTNER_ID) {
//         (function (l) {
//             if (!window.lintrk) {
//                 window.lintrk = function (a, b) { window.lintrk.q.push([a, b]) };
//                 window.lintrk.q = [];
//             }
//             var s = document.getElementsByTagName("script")[0];
//             var b = document.createElement("script"); b.async = true;
//             b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
//             s.parentNode.insertBefore(b, s);
//         })();
//     }

//     // --- Twitter Pixel ---
//     if (config.TWITTER_PIXEL_ID) {
//         !(function (e, t, n, s, u, a) {
//             e.twq || (s = e.twq = function () { s.exe ? s.exe.apply(s, arguments) : s.queue.push(arguments) }, s.version = "1.1", s.queue = [], u = t.createElement(n), u.async = !0, u.src = "https://static.ads-twitter.com/uwt.js", a = t.getElementsByTagName(n)[0], a.parentNode.insertBefore(u, a));
//         })(window, document, "script");
//         twq("init", config.TWITTER_PIXEL_ID);
//         twq("track", "PageView");
//     }

//     // --- Reddit Pixel ---
//     if (config.REDDIT_PIXEL_ID) {
//         !(function (w, d) {
//             if (!w.rdt) {
//                 var p = w.rdt = function () { p.sendEvent ? p.sendEvent.apply(p, arguments) : p.callQueue.push(arguments) };
//                 p.callQueue = []; var s = d.createElement("script"); s.src = "https://www.redditstatic.com/ads/pixel.js"; s.async = !0;
//                 var x = d.getElementsByTagName("script")[0]; x.parentNode.insertBefore(s, x);
//             }
//         })(window, document);
//         rdt("init", config.REDDIT_PIXEL_ID);
//         rdt("track", "PageVisit");
//     }

//     // --- Quora Pixel ---
//     if (config.QUORA_PIXEL_ID) {
//         !(function (q, e, v, n, t, s) {
//             if (q.qp) return;
//             n = q.qp = function () { n.qp ? n.qp.apply(n, arguments) : n.queue.push(arguments) };
//             n.queue = [];
//             t = document.createElement(e); t.async = !0; t.src = v;
//             s = document.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
//         })(window, "script", "https://a.quora.com/qevents.js");
//         qp("init", config.QUORA_PIXEL_ID);
//         qp("track", "ViewContent");
//     }
// };