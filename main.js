/* Minkyung Gwak portfolio: theme, role lens, tabs, dashboards, filters, downloads.
   Plain JavaScript, no build step and no dependencies. */
(function () {
'use strict';

var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent) {
  var e = document.createElementNS(NS, tag);
  for (var k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function div(cls, parent) { var d = document.createElement('div'); if (cls) d.className = cls; if (parent) parent.appendChild(d); return d; }

/* ---------- theme (dark by default) ---------- */
var root = document.documentElement;
function curTheme() { return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
try { if (localStorage.getItem('mg-theme') === 'light') root.setAttribute('data-theme', 'light'); } catch (e) {}
var themeBtn = $('#theme');
function themeLabel() { themeBtn.textContent = curTheme() === 'dark' ? 'Light mode' : 'Dark mode'; }
themeBtn.addEventListener('click', function () {
  var next = curTheme() === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('mg-theme', next); } catch (e) {}
  themeLabel();
});
themeLabel();

/* ---------- scroll progress, active nav, spotlight ---------- */
var progress = $('.progress');
function onScroll() {
  var h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.setProperty('--p', h > 0 ? Math.min(1, window.scrollY / h) : 0);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
if (window.IntersectionObserver) {
  var links = $$('.nav a');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id); });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('main section[id]').forEach(function (s) { io.observe(s); });
}
if (window.matchMedia && matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', function (e) {
    document.body.style.setProperty('--mx', e.clientX + 'px');
    document.body.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });
}

/* ---------- role lens ---------- */
var LENS_TEXT = {
  all: 'Library and information science graduate who has forecast demand for medical x-ray detectors, tracked manufacturing quality in Ohio and read what customers say about both. I build dashboards, find the pattern in feedback and turn it into a decision.',
  pm: 'As a product manager, I turn customer feedback, shipment data and manufacturing signals into priorities that sales, engineering and operations can all act on.',
  ux: 'As a UX researcher, I read what customers say, find the friction behind it and bring it to the people who can fix it, with the data to back it up.',
  bi: 'As a BI analyst, I build the forecasts and dashboards that tell a team what happened, how much to trust it and what to check next.'
};
var LENS_NAME = { pm: 'Product Manager', ux: 'UX Researcher', bi: 'BI Analyst' };
function setLens(l) {
  document.body.setAttribute('data-lens', l);
  $$('[data-lens]', $('.lens')).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lens') === l)); });
  $('#lede').textContent = LENS_TEXT[l];
  $('#lens-note').textContent = l === 'all'
    ? 'Choose a role at the top of the page to highlight the skills that matter most for it.'
    : 'Highlighted: skills that matter most for a ' + LENS_NAME[l] + '. Dashed items matter less for this role.';
}
$$('[data-lens]', $('.lens')).forEach(function (b) { b.addEventListener('click', function () { setLens(b.getAttribute('data-lens')); }); });
setLens('all');

/* ---------- tabs ---------- */
function makeTabs(listSel, onChange) {
  var list = $(listSel), tabs = $$('[role=tab]', list);
  function select(t, focus) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) t.focus();
    if (onChange) onChange(t);
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t, false); });
    t.addEventListener('keydown', function (e) {
      var j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); select(tabs[j], true); }
    });
  });
  return function (n) { select(tabs[n], false); };
}
makeTabs('#case-tabs');
var pickDash = makeTabs('#dash-tabs', function () { drawAll(); });
$$('[data-goto-dash]').forEach(function (b) {
  b.addEventListener('click', function () {
    pickDash(Number(b.getAttribute('data-goto-dash')) - 1);
    var t = document.getElementById('dashboards');
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ---------- activity filters ---------- */
$$('[data-filter]').forEach(function (b) {
  b.addEventListener('click', function () {
    var f = b.getAttribute('data-filter');
    $$('[data-filter]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    $$('.more-card').forEach(function (c) {
      c.hidden = f !== 'all' && (' ' + c.getAttribute('data-tags') + ' ').indexOf(' ' + f + ' ') === -1;
    });
  });
});

/* ---------- chart helpers ---------- */
function press(group, attr, val) { $$('[' + attr + ']', group).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(val))); }); }
function tipAt(host, tip, x, y, html) {
  tip.innerHTML = html; tip.hidden = false;
  var w = tip.offsetWidth, h = tip.offsetHeight, hw = host.clientWidth;
  var left = x + 14; if (left + w > hw) left = x - 14 - w; if (left < 0) left = 0;
  var top = Math.max(0, Math.min(y - h / 2, host.clientHeight - h));
  tip.style.left = left + 'px'; tip.style.top = top + 'px';
}
function barPath(x, y, w, h, r) {
  r = Math.max(0, Math.min(r, h, w / 2));
  return 'M' + x + ',' + (y + h) + 'V' + (y + r) + 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + 'V' + (y + h) + 'Z';
}
function table(host, head, rows) {
  var h = '<table><thead><tr>' + head.map(function (c) { return '<th scope="col">' + c + '</th>'; }).join('') + '</tr></thead><tbody>';
  rows.forEach(function (r) { h += '<tr>' + r.map(function (c, i) { return i === 0 ? '<th scope="row">' + c + '</th>' : '<td>' + c + '</td>'; }).join('') + '</tr>'; });
  host.innerHTML = h + '</tbody></table>';
}
function kpis(host, items) {
  host.innerHTML = items.map(function (k) { return '<div><dt>' + k[0] + '</dt><dd' + (k[3] ? ' class="' + k[3] + '"' : '') + '>' + k[1] + '<small>' + k[2] + '</small></dd></div>'; }).join('');
}
function hoverKeys(svg, ov, getCount, getIndexFromX, show, hide, startAt) {
  var cur = startAt;
  ov.addEventListener('pointermove', function (e) { var r = svg.getBoundingClientRect(); cur = getIndexFromX(e.clientX - r.left); show(cur); });
  ov.addEventListener('pointerleave', hide);
  svg.addEventListener('focus', function () { show(cur); });
  svg.addEventListener('blur', hide);
  svg.addEventListener('keydown', function (e) {
    var n = getCount();
    if (e.key === 'ArrowRight') { e.preventDefault(); cur = Math.min(n - 1, cur + 1); show(cur); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); cur = Math.max(0, cur - 1); show(cur); }
    else if (e.key === 'Escape') hide();
  });
}

/* ---------- dashboard 1: forecast error (sample data) ---------- */
var ERR = [25.0, 24.1, 25.6, 23.4, 22.8, 23.9, 21.7, 20.5, 21.2, 19.6, 18.9, 19.8, 17.4, 16.8, 17.9, 15.6, 15.1, 14.2, 14.8, 13.1, 12.6, 12.9, 11.4, 11.8, 10.6, 10.0];
var SHIP = ERR.map(function (_, i) { return Math.round((100 + 14 * Math.sin(i * 0.55) + 6 * Math.cos(i * 1.3)) * 10) / 10; });
var FCST = ERR.map(function (e, i) { return Math.round(SHIP[i] * (1 + ((i % 3 === 1) ? -1 : 1) * e / 100) * 10) / 10; });
var d1 = { mode: 'err', range: 26 };
function drawD1() {
  var host = $('#chart-d1'), W = host.clientWidth; if (W < 60) return;
  var H = W < 560 ? 270 : 350, m = { l: 48, r: 66, t: 26, b: 34 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
  var n = d1.range, off = 26 - n, idx = [], q, v;
  for (q = 0; q < n; q++) idx.push(off + q);
  var yMin, yMax, ticks = [];
  if (d1.mode === 'err') { yMin = 0; yMax = 30; ticks = [0, 10, 20, 30]; }
  else {
    var all = []; idx.forEach(function (i) { all.push(FCST[i], SHIP[i]); });
    yMin = Math.floor(Math.min.apply(null, all) / 10) * 10; yMax = Math.ceil(Math.max.apply(null, all) / 10) * 10;
    for (v = yMin; v <= yMax; v += 10) ticks.push(v);
  }
  var X = function (i) { return m.l + (n === 1 ? 0 : i / (n - 1) * pw); };
  var Y = function (val) { return m.t + ph - (val - yMin) / (yMax - yMin) * ph; };
  host.innerHTML = '';
  var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', tabindex: '0',
    'aria-label': d1.mode === 'err'
      ? 'Line chart of Europe weekly forecast error, from ' + ERR[off].toFixed(1) + ' percent to ' + ERR[25].toFixed(1) + ' percent. Use arrow keys to read each week, or switch to the table view.'
      : 'Line chart of weekly forecast and shipped units. Use arrow keys to read each week, or switch to the table view.' }, host);
  ticks.forEach(function (t) {
    el('line', { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t), class: t === yMin ? 'base' : 'grid' }, svg);
    var tx = el('text', { x: m.l - 10, y: Y(t) + 4, 'text-anchor': 'end', class: 'axt' }, svg);
    tx.textContent = d1.mode === 'err' ? t + '%' : t;
  });
  var step = n > 13 ? 5 : 2;
  idx.forEach(function (wk, i) {
    if (i % step === 0 || (i === n - 1 && (n - 1) % step >= 2)) {
      var t = el('text', { x: X(i), y: H - 10, 'text-anchor': 'middle', class: 'axt' }, svg); t.textContent = 'W' + (wk + 1);
    }
  });
  function pts(arr) { return idx.map(function (wk, i) { return X(i) + ',' + Y(arr[wk]); }).join(' '); }
  if (d1.mode === 'err') {
    el('path', { d: 'M' + X(0) + ',' + Y(0) + ' L' + pts(ERR).split(' ').join(' L') + ' L' + X(n - 1) + ',' + Y(0) + ' Z', class: 'area' }, svg);
    el('polyline', { points: pts(ERR), class: 'ln a' }, svg);
    [0, n - 1].forEach(function (i) {
      el('circle', { cx: X(i), cy: Y(ERR[idx[i]]), r: 6, class: 'pt a' }, svg);
      var t = el('text', { x: X(i) + (i === 0 ? 10 : -10), y: Y(ERR[idx[i]]) - 14, 'text-anchor': i === 0 ? 'start' : 'end', class: 'vlab' }, svg);
      t.textContent = ERR[idx[i]].toFixed(1) + '%';
    });
  } else {
    el('polyline', { points: pts(SHIP), class: 'ln a' }, svg);
    el('polyline', { points: pts(FCST), class: 'ln b' }, svg);
    var ls = SHIP[25], lf = FCST[25], hi = ls >= lf;
    var t1 = el('text', { x: X(n - 1) + 10, y: Y(ls) + (hi ? -2 : 16), class: 'vlab' }, svg); t1.textContent = 'Shipped';
    var t2 = el('text', { x: X(n - 1) + 10, y: Y(lf) + (hi ? 16 : -2), class: 'vlab' }, svg); t2.textContent = 'Forecast';
    el('circle', { cx: X(n - 1), cy: Y(ls), r: 6, class: 'pt a' }, svg);
    el('circle', { cx: X(n - 1), cy: Y(lf), r: 6, class: 'pt b' }, svg);
  }
  var cross = el('line', { y1: m.t, y2: m.t + ph, class: 'cross', style: 'display:none' }, svg);
  var dA = el('circle', { r: 6, class: 'pt a', style: 'display:none' }, svg), dB = el('circle', { r: 6, class: 'pt b', style: 'display:none' }, svg);
  var tip = div('tip', host); tip.hidden = true;
  function row(label, val) { return '<span><em style="font-style:normal">' + label + '</em><strong>' + val + '</strong></span>'; }
  function show(i) {
    var wk = idx[i], x = X(i), yy;
    cross.setAttribute('x1', x); cross.setAttribute('x2', x); cross.style.display = '';
    dA.setAttribute('cx', x);
    if (d1.mode === 'err') {
      dA.setAttribute('cy', Y(ERR[wk])); dA.style.display = ''; dB.style.display = 'none'; yy = Y(ERR[wk]);
      tipAt(host, tip, x, yy, '<b>Week ' + (wk + 1) + '</b>' + row('Forecast error', ERR[wk].toFixed(1) + '%'));
    } else {
      dA.setAttribute('cy', Y(SHIP[wk])); dB.setAttribute('cx', x); dB.setAttribute('cy', Y(FCST[wk])); dA.style.display = ''; dB.style.display = '';
      yy = (Y(SHIP[wk]) + Y(FCST[wk])) / 2;
      tipAt(host, tip, x, yy, '<b>Week ' + (wk + 1) + '</b>' + row('Shipped', SHIP[wk].toFixed(1)) + row('Forecast', FCST[wk].toFixed(1)) + row('Error', ERR[wk].toFixed(1) + '%'));
    }
  }
  function hide() { cross.style.display = 'none'; dA.style.display = 'none'; dB.style.display = 'none'; tip.hidden = true; }
  var ov = el('rect', { x: m.l, y: m.t, width: pw, height: ph, fill: 'transparent' }, svg);
  hoverKeys(svg, ov, function () { return n; }, function (px) { return Math.max(0, Math.min(n - 1, Math.round((px - m.l) / pw * (n - 1)))); }, show, hide, n - 1);
  var a = ERR[off], b = ERR[25], avg = idx.reduce(function (s, i) { return s + ERR[i]; }, 0) / n;
  kpis($('#kpi-d1'), [['Week ' + (off + 1), a.toFixed(1) + '%', 'forecast error'], ['Week 26', b.toFixed(1) + '%', 'forecast error'], ['Change', '▼ ' + (a - b).toFixed(1) + ' pts', 'average in range ' + avg.toFixed(1) + '%', 'good']]);
  table($('#tbl-d1'), ['Week', 'Shipped (indexed)', 'Forecast (indexed)', 'Error'], idx.map(function (i) { return ['W' + (i + 1), SHIP[i].toFixed(1), FCST[i].toFixed(1), ERR[i].toFixed(1) + '%']; }));
  $('#legend-d1').hidden = d1.mode !== 'vol' || !$('#tbl-d1').hidden;
}

/* ---------- dashboard 2: discrepancies (sample data) ---------- */
var MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
var CATS = {
  color: { n: 'Colour mismatch', v: [16, 15, 14, 12, 11, 9, 8, 6, 5, 4, 3, 3] },
  flash: { n: 'Flash', v: [10, 10, 9, 9, 8, 7, 6, 5, 4, 3, 2, 2] },
  short: { n: 'Short shot', v: [8, 7, 7, 6, 5, 5, 4, 3, 3, 2, 2, 2] },
  sink: { n: 'Sink marks', v: [6, 6, 5, 5, 4, 3, 3, 2, 2, 1, 1, 1] },
  other: { n: 'Other', v: [5, 5, 5, 4, 4, 3, 3, 2, 2, 2, 1, 1] }
};
var d2 = { on: { color: true, flash: true, short: true, sink: true, other: true } };
function d2keys() { return Object.keys(CATS).filter(function (k) { return d2.on[k]; }); }
function d2tot(i) { return d2keys().reduce(function (s, k) { return s + CATS[k].v[i]; }, 0); }
function drawD2() {
  var host = $('#chart-d2'), W = host.clientWidth; if (W < 60) return;
  var H = W < 560 ? 270 : 350, m = { l: 44, r: 12, t: 32, b: 34 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
  var tots = MONTHS.map(function (_, i) { return d2tot(i); }), mx = Math.max.apply(null, tots);
  var yMax = Math.max(10, Math.ceil(mx / 10) * 10), ticks = [], t;
  for (t = 0; t <= yMax; t += (yMax > 30 ? 10 : 5)) ticks.push(t);
  var band = pw / 12, bw = Math.min(44, band * 0.62), Y = function (val) { return m.t + ph - val / yMax * ph; };
  host.innerHTML = '';
  var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', tabindex: '0',
    'aria-label': 'Bar chart of recorded discrepancies per month, from ' + tots[0] + ' in August to ' + tots[11] + ' in July. Use arrow keys to read each month, or switch to the table view.' }, host);
  ticks.forEach(function (tk) {
    el('line', { x1: m.l, x2: W - m.r, y1: Y(tk), y2: Y(tk), class: tk === 0 ? 'base' : 'grid' }, svg);
    var tx = el('text', { x: m.l - 10, y: Y(tk) + 4, 'text-anchor': 'end', class: 'axt' }, svg); tx.textContent = tk;
  });
  var bars = [];
  MONTHS.forEach(function (mn, i) {
    var cx = m.l + band * (i + 0.5), h = tots[i] / yMax * ph;
    if (band >= 38 || i % 2 === 0) { var lx = el('text', { x: cx, y: H - 10, 'text-anchor': 'middle', class: 'axt' }, svg); lx.textContent = mn; }
    bars.push(el('path', { d: barPath(cx - bw / 2, Y(tots[i]), bw, h, 4), class: 'cbar' }, svg));
    if ((i === 0 || i === 11) && tots[i] > 0) { var vt = el('text', { x: cx, y: Y(tots[i]) - 10, 'text-anchor': 'middle', class: 'vlab' }, svg); vt.textContent = tots[i]; }
  });
  var tip = div('tip', host); tip.hidden = true;
  function show(i) {
    bars.forEach(function (b, j) { b.setAttribute('class', j === i ? 'cbar hov' : 'cbar'); });
    var html = '<b>' + MONTHS[i] + (i < 5 ? ' 2024' : ' 2025') + '</b>' + d2keys().map(function (k) {
      return '<span><em style="font-style:normal">' + CATS[k].n + '</em><strong>' + CATS[k].v[i] + '</strong></span>';
    }).join('') + '<span style="border-top:1px solid rgba(128,128,128,.4);margin-top:4px;padding-top:4px"><em style="font-style:normal">Total</em><strong>' + tots[i] + '</strong></span>';
    tipAt(host, tip, m.l + band * (i + 0.5), Y(tots[i]), html);
  }
  function hide() { bars.forEach(function (b) { b.setAttribute('class', 'cbar'); }); tip.hidden = true; }
  var ov = el('rect', { x: m.l, y: 0, width: pw, height: H - m.b, fill: 'transparent' }, svg);
  hoverKeys(svg, ov, function () { return 12; }, function (px) { return Math.max(0, Math.min(11, Math.floor((px - m.l) / band))); }, show, hide, 11);
  var f = tots[0], l = tots[11], red = f ? Math.round((f - l) / f * 100) : 0;
  kpis($('#kpi-d2'), [['Aug 2024', String(f), 'discrepancies recorded'], ['Jul 2025', String(l), l < 10 ? 'fewer than 10' : 'discrepancies recorded'], ['Reduction', '▼ ' + red + '%', 'across the selected types', 'good']]);
  var keys = d2keys();
  table($('#tbl-d2'), ['Month'].concat(keys.map(function (k) { return CATS[k].n; })).concat(['Total']),
    MONTHS.map(function (mn, i) { return [mn + (i < 5 ? ' 2024' : ' 2025')].concat(keys.map(function (k) { return String(CATS[k].v[i]); })).concat([String(tots[i])]); }));
}

/* ---------- dashboard 3: feedback themes (sample data) ---------- */
var THEMES = [
  { k: 'Colour matching', all: 96, mid: 58, latam: 38 },
  { k: 'Injection-molding defects', all: 78, mid: 52, latam: 26 },
  { k: 'Lead time', all: 41, mid: 19, latam: 22 },
  { k: 'Technical documentation', all: 29, mid: 14, latam: 15 },
  { k: 'Pricing and quotes', all: 22, mid: 9, latam: 13 },
  { k: 'Communication', all: 18, mid: 6, latam: 12 }
];
var d3 = { seg: 'all', sort: 'count' };
function drawD3() {
  var host = $('#chart-d3'), seg = d3.seg;
  var rows = THEMES.slice();
  if (d3.sort === 'count') rows.sort(function (a, b) { return b[seg] - a[seg]; }); else rows.sort(function (a, b) { return a.k < b.k ? -1 : 1; });
  var total = THEMES.reduce(function (s, r) { return s + r[seg]; }, 0), mx = Math.max.apply(null, THEMES.map(function (r) { return r[seg]; }));
  host.innerHTML = rows.map(function (r) {
    var p = Math.round(r[seg] / total * 100);
    return '<li class="hb" title="' + r.k + ': ' + r[seg] + ' mentions, ' + p + '% of all mentions"><span class="l">' + r.k + '</span><span class="trk"><span class="fill" style="width:' + (r[seg] / mx * 100) + '%"></span></span><span class="v">' + r[seg] + ' · ' + p + '%</span></li>';
  }).join('');
  var top = THEMES.slice().sort(function (a, b) { return b[seg] - a[seg]; }), two = Math.round((top[0][seg] + top[1][seg]) / total * 100);
  kpis($('#kpi-d3'), [
    ['Mentions coded', String(total), { all: 'all customers', mid: 'US Midwest automotive', latam: 'Latin America' }[seg]],
    ['Top theme', top[0].k, Math.round(top[0][seg] / total * 100) + '% of mentions'],
    ['Top two themes', two + '%', top[0].k + ' and ' + top[1].k]
  ]);
  table($('#tbl-d3'), ['Theme', 'Mentions', 'Share'], rows.map(function (r) { return [r.k, String(r[seg]), Math.round(r[seg] / total * 100) + '%']; }));
}

/* ---------- controls ---------- */
$$('[data-d1-mode]').forEach(function (b) { b.addEventListener('click', function () { d1.mode = b.getAttribute('data-d1-mode'); press($('#dash-1'), 'data-d1-mode', d1.mode); drawD1(); }); });
$$('[data-d1-range]').forEach(function (b) { b.addEventListener('click', function () { d1.range = Number(b.getAttribute('data-d1-range')); press($('#dash-1'), 'data-d1-range', d1.range); drawD1(); }); });
$$('[data-cat]').forEach(function (b) {
  b.addEventListener('click', function () {
    var k = b.getAttribute('data-cat');
    if (d2.on[k] && d2keys().length === 1) return;
    d2.on[k] = !d2.on[k]; b.setAttribute('aria-pressed', String(d2.on[k])); drawD2();
  });
});
$$('[data-seg]').forEach(function (b) { b.addEventListener('click', function () { d3.seg = b.getAttribute('data-seg'); press($('#dash-3'), 'data-seg', d3.seg); drawD3(); }); });
$$('[data-sort]').forEach(function (b) { b.addEventListener('click', function () { d3.sort = b.getAttribute('data-sort'); press($('#dash-3'), 'data-sort', d3.sort); drawD3(); }); });
$$('[data-view]').forEach(function (b) {
  b.addEventListener('click', function () {
    var id = b.getAttribute('data-view'), on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'View as chart' : 'View as table';
    $('#tbl-' + id).hidden = !on; $('#chart-' + id).hidden = on;
    drawAll();
  });
});

function drawAll() {
  if (!$('#dash-1').hidden) drawD1();
  if (!$('#dash-2').hidden) drawD2();
  if (!$('#dash-3').hidden) drawD3();
}
var raf = 0;
function schedule() { cancelAnimationFrame(raf); raf = requestAnimationFrame(drawAll); }
if (window.ResizeObserver) {
  var ro = new ResizeObserver(schedule);
  ['chart-d1', 'chart-d2'].forEach(function (id) { ro.observe(document.getElementById(id)); });
}
window.addEventListener('resize', schedule);
drawAll();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);

/* ---------- résumé download ----------
   On GitHub Pages the button is a plain download link to assets/Minkyung_Gwak_CV.docx.
   Only the Claude preview embeds the file as base64 (#cv-data) and asks the viewer to confirm a save. */
var dlStatus = $('#dl-status');
var cvData = $('#cv-data');
if (cvData) {
  $('#dl-btn').addEventListener('click', function (ev) {
    ev.preventDefault();
    dlStatus.textContent = 'Preparing the file…';
    var blob;
    try {
      var bin = atob(cvData.textContent.replace(/\s+/g, '')), u = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      blob = new Blob([u], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    } catch (e) { dlStatus.textContent = 'The file could not be prepared. Email me and I will send it.'; return; }
    var cap = (window.claude && typeof window.claude.use === 'function') ? window.claude.use('downloads') : Promise.resolve(null);
    cap.then(function (d) {
      if (d) return d.save({ filename: 'Minkyung_Gwak_CV.docx', data: blob }).then(function () { dlStatus.textContent = 'Saved. Thank you for reading.'; });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Minkyung_Gwak_CV.docx';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      dlStatus.textContent = 'Download requested.';
    }).catch(function (e) {
      dlStatus.textContent = (e && e.code === 'declined') ? 'Download cancelled.' : 'The file could not be saved from here. Email me and I will send it.';
    });
  });
} else {
  $('#dl-btn').addEventListener('click', function () { dlStatus.textContent = 'Download requested.'; });
}

/* ---------- copy email ---------- */
$('#copy').addEventListener('click', function () {
  var st = $('#copy-status'), txt = $('#email').textContent;
  function fallback() {
    var r = document.createRange(); r.selectNodeContents($('#email'));
    var s = getSelection(); s.removeAllRanges(); s.addRange(r);
    st.textContent = 'Address selected. Press Ctrl+C or ⌘C to copy.';
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(function () { st.textContent = 'Email address copied.'; }).catch(fallback);
  } else fallback();
});
})();
