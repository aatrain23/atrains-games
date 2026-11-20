/* You're the Ref: shared engine. Draws five playing surfaces and plays keyframed scenarios.
   Used by the game (index.html) and by the video renderer (video.html). World units per sport; y grows down the screen. */
(function (root) {
  "use strict";
  var TAU = Math.PI * 2;
  var COL = { a: "#3f7fe8", b: "#e0453f", gk: "#f4c430", ink: "#0b120e", chalk: "#f3f5ef", yellow: "#f4c430" };
  function cl(x) { return Math.max(0, Math.min(1, x)); }
  function sm(k) { k = cl(k); return k * k * (3 - 2 * k); }
  function at(keys, t) { // keys: [[t, x, y, h?], ...] -> [x, y, h]
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2], keys[0][3] || 0];
    for (var i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        var a = keys[i - 1], b = keys[i], k = (t - a[0]) / (b[0] - a[0] || 1), e = b[4] === "lin" ? k : sm(k);
        var h = (a[3] || 0) + ((b[3] || 0) - (a[3] || 0)) * k;
        if (b[4] === "arc") { h = (a[3] || 0) * (1 - k) + (b[3] || 0) * k + 4 * b[5] * k * (1 - k); e = k; }
        return [a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e, h];
      }
    }
    var z = keys[keys.length - 1]; return [z[1], z[2], z[3] || 0];
  }

  /* ---------- surfaces (drawn in world units; u = world units per pixel for hairlines) ---------- */
  var SURF = {
    nfl: function (c) { // yards. y: 0 end line, 10 goal line, then yards upfield
      c.fillStyle = "#0f2417"; c.fillRect(-20, -20, 100, 140);
      c.fillStyle = "#e9ece6"; c.fillRect(-2, -2, 57.33, 110);
      for (var i = 0; i < 20; i++) { c.fillStyle = i % 2 ? "#23763f" : "#1f6c39"; c.fillRect(0, 10 + i * 5, 53.33, 5); }
      c.fillStyle = "#1c4f9c"; c.fillRect(0, 0, 53.33, 10);
      c.fillStyle = "rgba(255,255,255,.35)"; c.font = "800 5.4px 'Barlow Condensed', Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("END ZONE", 26.66, 5.2);
      c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = 0.22;
      for (var y = 15; y <= 100; y += 5) { c.beginPath(); c.moveTo(0, y); c.lineTo(53.33, y); c.stroke(); }
      for (var yy = 11; yy < 100; yy++) { if ((yy - 10) % 5) { [0.6, 23.4, 29.3, 52.1].forEach(function (x) { c.beginPath(); c.moveTo(x, yy); c.lineTo(x + 0.66, yy); c.stroke(); }); } }
      c.lineWidth = 0.5; c.beginPath(); c.moveTo(0, 10); c.lineTo(53.33, 10); c.stroke();
      c.fillStyle = "rgba(255,255,255,.85)"; c.font = "700 3.4px 'Barlow Condensed', Arial, sans-serif";
      [10, 20, 30].forEach(function (n) { [8, 45.3].forEach(function (x) { c.fillText(String(n), x, 10 + n); }); });
      c.strokeStyle = "#f4c430"; c.lineWidth = 0.45; c.beginPath(); c.moveTo(23.58, -0.6); c.lineTo(29.75, -0.6); c.moveTo(26.66, -0.6); c.lineTo(26.66, -2.6); c.stroke(); c.fillStyle = "#f4c430"; c.beginPath(); c.arc(23.58, -0.6, 0.5, 0, TAU); c.arc(29.75, -0.6, 0.5, 0, TAU); c.fill();
      c.fillStyle = "#ff7a1a"; [[0, 10], [53.33, 10], [0, 0], [53.33, 0]].forEach(function (p) { c.fillRect(p[0] - 0.45, p[1] - 0.45, 0.9, 0.9); });
    },
    nba: function (c) { // feet. baseline y = 0, basket at (25, 5.25)
      c.fillStyle = "#17120c"; c.fillRect(-30, -30, 110, 130);
      c.fillStyle = "#c99a62"; c.fillRect(0, 0, 50, 94);
      c.fillStyle = "rgba(120,70,30,.10)"; for (var i = 0; i < 25; i += 2) c.fillRect(i * 2, 0, 2, 94);
      c.fillStyle = "#b4502e"; c.fillRect(17, 0, 16, 19);
      c.strokeStyle = "#fff"; c.lineWidth = 0.33; c.strokeRect(0, 0, 50, 94); c.strokeRect(17, 0, 16, 19);
      c.beginPath(); c.arc(25, 19, 6, 0, TAU); c.stroke();
      var a0 = Math.acos(22 / 23.75); c.beginPath(); c.moveTo(3, 0); c.lineTo(3, 5.25 + 23.75 * Math.sin(a0)); c.arc(25, 5.25, 23.75, Math.PI - a0, a0, true); c.lineTo(47, 0); c.stroke();
      c.beginPath(); c.arc(25, 5.25, 4, 0, Math.PI); c.stroke();
      c.beginPath(); c.moveTo(0, 47); c.lineTo(50, 47); c.stroke(); c.beginPath(); c.arc(25, 47, 6, 0, TAU); c.stroke();
      c.lineWidth = 0.5; c.beginPath(); c.moveTo(22, 4); c.lineTo(28, 4); c.stroke();
      c.strokeStyle = "#ff5a1f"; c.lineWidth = 0.3; c.beginPath(); c.arc(25, 5.25, 0.85, 0, TAU); c.stroke();
    },
    nhl: function (c) { // feet. end boards y = 0, goal line y = 11, blue line y = 75, centre line y = 100
      c.fillStyle = "#101820"; c.fillRect(-30, -30, 150, 180);
      c.beginPath(); c.moveTo(0, 130); c.lineTo(0, 28); c.arc(28, 28, 28, Math.PI, 1.5 * Math.PI); c.lineTo(57, 0); c.arc(57, 28, 28, 1.5 * Math.PI, 0); c.lineTo(85, 130); c.closePath();
      c.fillStyle = "#eaf3f8"; c.fill(); c.strokeStyle = "#20303c"; c.lineWidth = 1; c.stroke();
      c.save(); c.clip();
      c.fillStyle = "#2a6fd6"; c.fillRect(0, 74.5, 85, 1); c.fillStyle = "#d8343a"; c.fillRect(0, 99.5, 85, 1); c.fillRect(0, 10.9, 85, 0.2);
      c.strokeStyle = "#d8343a"; c.lineWidth = 0.2;
      [[20.5, 31], [64.5, 31]].forEach(function (p) { c.beginPath(); c.arc(p[0], p[1], 15, 0, TAU); c.stroke(); c.beginPath(); c.arc(p[0], p[1], 1, 0, TAU); c.fillStyle = "#d8343a"; c.fill(); });
      [[20.5, 80], [64.5, 80]].forEach(function (p) { c.beginPath(); c.arc(p[0], p[1], 1, 0, TAU); c.fillStyle = "#d8343a"; c.fill(); });
      c.beginPath(); c.arc(42.5, 11, 6, 0, Math.PI); c.closePath(); c.fillStyle = "#a9d4f2"; c.fill(); c.stroke();
      c.restore();
      c.fillStyle = "#fff"; c.fillRect(39.5, 7.6, 6, 3.4); c.strokeStyle = "#d8343a"; c.lineWidth = 0.35; c.strokeRect(39.5, 7.6, 6, 3.4);
      c.strokeStyle = "rgba(0,0,0,.18)"; c.lineWidth = 0.08; for (var x = 40; x < 45.5; x += 0.5) { c.beginPath(); c.moveTo(x, 7.6); c.lineTo(x, 11); c.stroke(); }
    },
    mlb: function (c) { // feet. home (100,190), 1B (163.6,126.4), 2B (100,62.7), 3B (36.4,126.4)
      c.fillStyle = "#256b34"; c.fillRect(-100, -100, 500, 500);
      c.fillStyle = "#2d7a3d"; c.beginPath(); c.moveTo(100, 190); c.lineTo(400, -110); c.lineTo(-200, -110); c.closePath(); c.fill();
      c.fillStyle = "#b9824f"; c.beginPath(); c.arc(100, 127, 97, 0, TAU); c.fill();
      c.fillStyle = "#2d7a3d"; c.beginPath(); c.moveTo(100, 181); c.lineTo(154, 127); c.lineTo(100, 73); c.lineTo(46, 127); c.closePath(); c.fill();
      c.fillStyle = "#256b34"; c.beginPath(); c.moveTo(100, 190); c.lineTo(204, 86); c.lineTo(260, 86); c.lineTo(260, 260); c.lineTo(100, 260); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(100, 190); c.lineTo(-4, 86); c.lineTo(-60, 86); c.lineTo(-60, 260); c.lineTo(100, 260); c.closePath(); c.fill();
      c.fillStyle = "#b9824f"; c.beginPath(); c.arc(100, 190, 13, 0, TAU); c.fill(); c.beginPath(); c.arc(100, 129.5, 9, 0, TAU); c.fill();
      c.save(); c.translate(100, 190); c.rotate(-Math.PI / 4); c.fillRect(0, -3, 96, 6); c.restore();
      c.save(); c.translate(100, 190); c.rotate(-3 * Math.PI / 4); c.fillRect(0, -3, 96, 6); c.restore();
      c.strokeStyle = "#fff"; c.lineWidth = 0.6; c.beginPath(); c.moveTo(100, 190); c.lineTo(400, -110); c.moveTo(100, 190); c.lineTo(-200, -110); c.stroke();
      c.fillStyle = "#fff"; [[161.9, 126.4], [100, 62.7], [38.1, 126.4]].forEach(function (p) { c.save(); c.translate(p[0], p[1]); c.rotate(Math.PI / 4); c.fillRect(-1.7, -1.7, 3.4, 3.4); c.restore(); });
      c.beginPath(); c.moveTo(100, 191.4); c.lineTo(98.6, 190); c.lineTo(98.6, 188.6); c.lineTo(101.4, 188.6); c.lineTo(101.4, 190); c.closePath(); c.fill(); c.fillRect(98.8, 129, 2.4, 0.7);
    },
    lax: function (c) { // yards. end line y = 0, goal line y = 15, restraining line y = 35, midfield y = 55
      c.fillStyle = "#0f2417"; c.fillRect(-20, -20, 100, 150);
      for (var i = 0; i < 12; i++) { c.fillStyle = i % 2 ? "#2b7f45" : "#277540"; c.fillRect(0, i * 10, 60, 10); }
      c.strokeStyle = "rgba(255,255,255,.92)"; c.lineWidth = 0.3; c.strokeRect(0, 0, 60, 110);
      c.beginPath(); c.moveTo(0, 35); c.lineTo(60, 35); c.moveTo(0, 55); c.lineTo(60, 55); c.moveTo(10, 0); c.lineTo(10, 35); c.moveTo(50, 0); c.lineTo(50, 35); c.stroke();
      c.beginPath(); c.arc(30, 15, 3, 0, TAU); c.fillStyle = "rgba(255,255,255,.14)"; c.fill(); c.stroke();
      c.strokeStyle = "#ff7a1a"; c.lineWidth = 0.35; c.beginPath(); c.moveTo(29, 15); c.lineTo(30, 13); c.lineTo(31, 15); c.closePath(); c.fillStyle = "rgba(255,255,255,.35)"; c.fill(); c.stroke();
    },
    pga: function (c) { // metres, close-up of the hole at (1.0, 0.75)
      c.fillStyle = "#3f9a52"; c.fillRect(-2, -2, 8, 8);
      for (var i = -4; i < 14; i++) { c.fillStyle = i % 2 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)"; c.fillRect(i * 0.34, -2, 0.34, 8); }
      c.fillStyle = "rgba(0,0,0,.25)"; c.beginPath(); c.arc(1.0, 0.757, 0.062, 0, TAU); c.fill();
      c.fillStyle = "#0c120e"; c.beginPath(); c.arc(1.0, 0.75, 0.054, 0, TAU); c.fill();
      c.strokeStyle = "#e9ece6"; c.lineWidth = 0.008; c.beginPath(); c.arc(1.0, 0.75, 0.054, 0, TAU); c.stroke();
    }
  };

  var BALL = {
    nfl: function (c, s) { c.save(); c.rotate(-0.6); c.scale(s, s); c.fillStyle = "#7a4521"; c.beginPath(); c.ellipse(0, 0, 13, 8, 0, 0, TAU); c.fill(); c.lineWidth = 2.5; c.strokeStyle = COL.ink; c.stroke(); c.strokeStyle = "#fff"; c.lineWidth = 2; c.beginPath(); c.moveTo(-5, 0); c.lineTo(5, 0); c.stroke(); c.restore(); },
    nba: function (c, s) { c.beginPath(); c.arc(0, 0, 10 * s, 0, TAU); c.fillStyle = "#e8792b"; c.fill(); c.lineWidth = 2.5; c.strokeStyle = COL.ink; c.stroke(); c.beginPath(); c.moveTo(-10 * s, 0); c.lineTo(10 * s, 0); c.lineWidth = 1.5; c.stroke(); },
    nhl: function (c, s) { c.beginPath(); c.arc(0, 0, 6.5 * s, 0, TAU); c.fillStyle = "#111"; c.fill(); c.lineWidth = 2; c.strokeStyle = "#fff"; c.stroke(); },
    mlb: function (c, s) { c.beginPath(); c.arc(0, 0, 7 * s, 0, TAU); c.fillStyle = "#fff"; c.fill(); c.lineWidth = 2.5; c.strokeStyle = COL.ink; c.stroke(); c.strokeStyle = "#d8343a"; c.lineWidth = 1.5; c.beginPath(); c.arc(-9 * s, 0, 7 * s, -0.7, 0.7); c.stroke(); },
    lax: function (c, s) { c.beginPath(); c.arc(0, 0, 6.5 * s, 0, TAU); c.fillStyle = "#fff"; c.fill(); c.lineWidth = 2.5; c.strokeStyle = COL.ink; c.stroke(); },
    pga: function (c, s) { c.beginPath(); c.arc(0, 0, 9 * s, 0, TAU); c.fillStyle = "#fff"; c.fill(); c.lineWidth = 2.5; c.strokeStyle = COL.ink; c.stroke(); }
  };



  function fit(view, rect) { // cover the rect with the view, centred
    var vw = view[2] - view[0], vh = view[3] - view[1], s = Math.max(rect[2] / vw, rect[3] / vh);
    return { s: s, ox: rect[0] + rect[2] / 2 - (view[0] + vw / 2) * s, oy: rect[1] + rect[3] / 2 - (view[1] + vh / 2) * s };
  }
  function draw(c, play, t, rect, opt) {
    opt = opt || {}; var f = fit(play.view, rect), PR = rect[2] * 0.029, X = function (x) { return f.ox + x * f.s; }, Y = function (y) { return f.oy + y * f.s; };
    c.save(); c.beginPath(); c.rect(rect[0], rect[1], rect[2], rect[3]); c.clip();
    c.save(); c.translate(f.ox, f.oy); c.scale(f.s, f.s); SURF[play.sport](c); c.restore();
    var b = at(play.ball, t), bs = rect[2] / 720, lift = b[2] * f.s * (play.sport === "pga" ? 0 : 0.28);
    if (opt.trail) { c.setLineDash([10 * bs, 9 * bs]); c.strokeStyle = "rgba(244,196,48,.9)"; c.lineWidth = 4 * bs; c.beginPath();
      for (var j = 0; j <= 60; j++) { var q = at(play.ball, t * j / 60); j ? c.lineTo(X(q[0]), Y(q[1])) : c.moveTo(X(q[0]), Y(q[1])); } c.stroke(); c.setLineDash([]); }
    var ents = play.actors.filter(function (a) { return a.from === undefined || t >= a.from; }).map(function (a) { var p = at(a.k, t); return { a: a, x: p[0], y: p[1] }; }).sort(function (m, n) { return m.y - n.y; });
    var sunk = play.sunkAt !== undefined && t >= play.sunkAt;
    ents.forEach(function (e) {
      var x = X(e.x), y = Y(e.y), col = e.a.team === "ref" ? "#fff" : COL[e.a.team];
      if (e.a.shape) { c.save(); c.translate(x, y);
        if (e.a.shape === "stick") { var kk = e.a.k, mv = t < kk[kk.length - 1][0]; c.rotate(mv ? t * 14 : 0.7); c.lineCap = "round"; c.strokeStyle = COL.ink; c.lineWidth = PR * 0.42; c.beginPath(); c.moveTo(-PR * 1.5, 0); c.lineTo(PR * 1.5, 0); c.lineTo(PR * 1.9, PR * 0.45); c.stroke(); c.strokeStyle = "#c9a26b"; c.lineWidth = PR * 0.22; c.stroke(); }
        if (e.a.shape === "glove") { c.rotate(t * 9); c.fillStyle = "#8a5a2b"; c.beginPath(); c.ellipse(0, 0, PR * 0.75, PR * 0.6, 0, 0, TAU); c.fill(); c.lineWidth = PR * 0.16; c.strokeStyle = COL.ink; c.stroke(); c.beginPath(); c.moveTo(-PR * 0.3, -PR * 0.5); c.lineTo(-PR * 0.3, PR * 0.1); c.moveTo(PR * 0.1, -PR * 0.58); c.lineTo(PR * 0.1, PR * 0.1); c.stroke(); }
        if (e.a.shape === "ball") { c.beginPath(); c.arc(0, 0, 0.0213 * f.s, 0, TAU); c.fillStyle = "#ffe9a8"; c.fill(); c.lineWidth = 2.5 * bs; c.strokeStyle = COL.ink; c.stroke(); }
        c.restore(); return; }
      c.fillStyle = "rgba(0,0,0,.28)"; c.beginPath(); c.ellipse(x, y + PR * 0.85, PR, PR * 0.4, 0, 0, TAU); c.fill();
      c.beginPath(); c.arc(x, y, PR, 0, TAU); c.fillStyle = col; c.fill();
      if (e.a.team === "ref") { c.save(); c.clip(); c.fillStyle = "#111"; for (var s = -3; s < 4; s += 2) c.fillRect(x + s * PR * 0.28 - PR * 0.14, y - PR, PR * 0.28, PR * 2); c.restore(); c.beginPath(); c.arc(x, y, PR, 0, TAU); }
      c.lineWidth = PR * 0.2; c.strokeStyle = COL.ink; c.stroke();
      if (e.a.team === "ref") { c.fillStyle = "#fff"; c.beginPath(); c.arc(x, y, PR * 0.52, 0, TAU); c.fill(); }
      c.fillStyle = e.a.team === "gk" || e.a.team === "ref" ? "#111" : "#fff"; c.font = "700 " + (PR * 0.95) + "px Barlow, Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(e.a.n, x, y + PR * 0.06);
    });
    var bx = X(b[0]), by = Y(b[1]) - lift;
    if (!sunk) { c.fillStyle = "rgba(0,0,0,.3)"; c.beginPath(); c.ellipse(X(b[0]) + lift * 0.3, Y(b[1]) + 6 * bs, 9 * bs, 4 * bs, 0, 0, TAU); c.fill(); }
    c.save(); c.translate(bx, by);
    if (play.sport === "pga") { var r = 0.0213 * f.s * (sunk ? 0.8 : 1); c.globalAlpha = sunk ? 0.55 : 1; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fillStyle = "#fff"; c.fill(); c.lineWidth = 2.5 * bs; c.strokeStyle = COL.ink; c.stroke(); }
    else BALL[play.sport](c, bs * (1 + b[2] * 0.035));
    c.restore();
    (play.marks || []).forEach(function (m) {
      if (t < m.t0 || t > m.t1) return; var k = cl((t - m.t0) / 0.2);
      if (m.type === "ring" || m.type === "ringAt") { var rx = m.type === "ring" ? bx : X(m.x), ry = m.type === "ring" ? by : Y(m.y); c.strokeStyle = COL.yellow; c.lineWidth = 5 * bs; c.beginPath(); c.arc(rx, ry, (26 + 4 * Math.sin(t * 9)) * bs, 0, TAU); c.stroke(); }
      if (m.type === "label") { chip(c, m.text, X(m.x), Y(m.y), 30 * bs, "#111", COL.yellow, k); }
      if (m.type === "timer") { var sec = Math.min(t, m.stop) - m.from; sec = Math.max(0, sec * m.rate); var over = sec > m.limit;
        chip(c, "WAITING  0:" + ("0" + Math.floor(sec)).slice(-2), X(m.x), Y(m.y), 34 * bs, "#fff", over ? COL.b : "rgba(0,0,0,.75)", k);
        chip(c, over ? "PAST THE 10-SECOND LIMIT" : "10-SECOND LIMIT", X(m.x), Y(m.y) + 52 * bs, 22 * bs, over ? COL.yellow : "#cfd8d2", "rgba(0,0,0,.6)", k); }
    });
    c.restore();
  }
  function chip(c, text, x, y, size, fg, bg, k) {
    c.save(); c.globalAlpha = k === undefined ? 1 : k; c.font = "800 " + size + "px 'Barlow Condensed', Arial, sans-serif"; var w = c.measureText(text).width + size * 0.9, h = size * 1.45;
    c.fillStyle = bg; rr(c, x - w / 2, y - h / 2, w, h, h * 0.3); c.fill(); c.fillStyle = fg; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, x, y + size * 0.05); c.restore();
  }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function capAt(play, t) { for (var i = 0; i < play.caps.length; i++) if (t >= play.caps[i][0] && t < play.caps[i][1]) return play.caps[i][2]; return ""; }

  root.YTR_SLATES = root.YTR_SLATES || {};
  root.YTR = { draw: draw, chip: chip, rr: rr, capAt: capAt, COL: COL, at: at, cl: cl, sm: sm };
})(window);
