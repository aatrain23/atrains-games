/* You're the Ref leaderboard. Paste into a new project at script.google.com, run setup() once (it creates the
   scores sheet), then Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
   Put the web app URL into LB_URL in index.html. */
var TAB = 'Scores';
function sheet_() {
  var props = PropertiesService.getScriptProperties(), id = props.getProperty('SHEET_ID'), ss;
  if (id) ss = SpreadsheetApp.openById(id);
  else { ss = SpreadsheetApp.create("You're the Ref Leaderboard"); props.setProperty('SHEET_ID', ss.getId()); }
  var s = ss.getSheetByName(TAB);
  if (!s) { s = ss.insertSheet(TAB); s.appendRow(['When', 'Day', 'Name', 'Score', 'Total', 'Seconds']); }
  return s;
}
function setup() { return sheet_().getParent().getUrl(); }
function board_(day) {
  var rows = sheet_().getDataRange().getValues().slice(1), today = [], all = {};
  rows.forEach(function (r) {
    var name = String(r[2]), key = name.toLowerCase();
    if (Number(r[1]) === day) today.push({ name: name, score: Number(r[3]), total: Number(r[4]), secs: Number(r[5]) });
    if (!all[key]) all[key] = { name: name, score: 0, days: 0 };
    all[key].score += Number(r[3]); all[key].days += 1;
  });
  today.sort(function (a, b) { return b.score - a.score || a.secs - b.secs; });
  var totals = Object.keys(all).map(function (k) { return all[k]; }).sort(function (a, b) { return b.score - a.score || a.days - b.days; });
  return { day: today.slice(0, 25), all: totals.slice(0, 25) };
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function doGet(e) { return json_(board_(Number(e.parameter.day) || 1)); }
function doPost(e) {
  var d; try { d = JSON.parse(e.postData.contents); } catch (x) { return json_({ error: 'Bad request.' }); }
  var day = Math.floor(Number(d.day)), total = Math.floor(Number(d.total)), score = Math.floor(Number(d.score)), secs = Number(d.secs);
  var name = String(d.name || '').replace(/[^A-Za-z0-9 _-]/g, '').trim().slice(0, 16);
  if (name.length < 2 || !(day >= 1 && day < 5000) || !(total >= 1 && total <= 12) || !(score >= 0 && score <= total) || !(secs >= 0 && secs < 3600)) return json_({ error: 'That score could not be posted.' });
  var lock = LockService.getScriptLock(); lock.waitLock(8000);
  try {
    var s = sheet_(), rows = s.getDataRange().getValues().slice(1);
    var dup = rows.some(function (r) { return Number(r[1]) === day && String(r[2]).toLowerCase() === name.toLowerCase(); });
    if (dup) return json_({ error: 'That name already posted a score today. Pick another name.' });
    s.appendRow([new Date(), day, name, score, total, Math.round(secs * 10) / 10]);
  } finally { lock.releaseLock(); }
  return json_(board_(day));
}
