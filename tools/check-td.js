// Validates Trade Desk slate files. Usage: node tools/check-td.js
const fs=require('fs'),path=require('path');global.window={};
const dir=path.join(__dirname,'..','trade-desk','slates');let bad=0;const seen={};
for(const f of fs.readdirSync(dir).filter(f=>/^day-\d+\.js$/.test(f)).sort((a,b)=>parseInt(a.slice(4))-parseInt(b.slice(4)))){
  require(path.join(dir,f));const n=+f.match(/\d+/)[0],R=window.TD_SLATES[n];const err=m=>{bad++;console.log(f+': '+m)};
  if(!Array.isArray(R)||R.length!==6){err('needs exactly 6 rounds');continue}
  for(const r of R){const e=m=>err(r.id+': '+m);
    if(seen[r.id])e('already used in '+seen[r.id]);seen[r.id]=f;
    if(!r.src||!/^https:\/\//.test(r.src.url)||!r.src.label)e('src needs an https url and a label');
    if(!r.why||r.why.length>220)e('why missing or over 220 characters');
    if(/\u2014/.test(JSON.stringify(r)))e('no em dashes');
    for(const k of['sport','year','note','sides','answer'])if(r[k]===undefined)e('missing '+k);
    if(!Array.isArray(r.sides)||r.sides.length!==2){e('needs exactly 2 sides');continue}
    if(r.answer!==0&&r.answer!==1)e('answer must be 0 or 1');if(r.note.length>90)e('note over 90 characters');
    const names=[];r.sides.forEach(s=>{if(!s.team||!Array.isArray(s.gets)||s.gets.length<1||s.gets.length>4||!s.after)e('each side needs team, 1 to 4 gets lines and after');
      else{if(s.gets.some(g=>g.length>64))e(s.team+': gets line over 64 characters');if(s.after.length>200)e(s.team+': after over 200 characters');names.push(...s.team.toLowerCase().split(' '))}});
    const shown=(r.note+' '+r.sides.map(s=>(s.gets||[]).join(' ')).join(' ')).toLowerCase();
    names.filter(w=>w.length>3).forEach(w=>{if(shown.includes(w))e('the note or a gets line gives away a team name: '+w)});
  }
}
require(path.join(dir,'latest.js'));const mx=Math.max(...Object.keys(window.TD_SLATES).map(Number));if(window.TD_LATEST!==mx){bad++;console.log('trade-desk/slates/latest.js says '+window.TD_LATEST+' but the newest slate is day '+mx)}
console.log(bad?bad+' problem(s)':'All slates OK ('+Object.keys(window.TD_SLATES).length+' days)');process.exit(bad?1:0);
