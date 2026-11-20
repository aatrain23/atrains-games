// Validates Draft Room slate files. Usage: node tools/check-dr.js
const fs=require('fs'),path=require('path');global.window={};
const dir=path.join(__dirname,'..','draft-room','slates');let bad=0;const seen={};
for(const f of fs.readdirSync(dir).filter(f=>/^day-\d+\.js$/.test(f)).sort((a,b)=>parseInt(a.slice(4))-parseInt(b.slice(4)))){
  require(path.join(dir,f));const n=+f.match(/\d+/)[0],R=window.DR_SLATES[n];const err=m=>{bad++;console.log(f+': '+m)};
  if(!Array.isArray(R)||R.length!==6){err('needs exactly 6 rounds');continue}
  for(const r of R){const e=m=>err(r.id+': '+m);
    for(const k of['id','year','pos','note','answer','prospects','why','src'])if(r[k]===undefined)e('missing '+k);
    if(seen[r.id])e('round already used in '+seen[r.id]);seen[r.id]=f;
    if(!Array.isArray(r.prospects)||r.prospects.length!==3){e('needs exactly 3 prospects');continue}
    if(!(r.answer>=0&&r.answer<3))e('answer index out of range');
    if(r.why.length>220)e('why over 220 characters');if(r.note.length>70)e('note over 70 characters');
    if(!r.src||!/^https:\/\//.test(r.src.url)||!r.src.label)e('src needs an https url and a label');
    for(const p of r.prospects){
      for(const k of['name','school','pick','pre','career'])if(p[k]===undefined)e('prospect missing '+k);
      if(!Array.isArray(p.pre)||p.pre.length<3||p.pre.length>5)e(p.name+': 3 to 5 pre-draft lines');
      else{if(p.pre.some(l=>l.length>60))e(p.name+': pre-draft line over 60 characters');
        const last=p.name.split(' ').pop().toLowerCase();if(p.pre.some(l=>l.toLowerCase().includes(last)||l.toLowerCase().includes(p.school.toLowerCase())))e(p.name+': a pre-draft line gives away the name or school')}
      if(p.career.length>130)e(p.name+': career over 130 characters')}
    if(/—/.test(JSON.stringify(r)))e('no em dashes')}
}
require(path.join(dir,'latest.js'));const mx=Math.max(...Object.keys(window.DR_SLATES).map(Number));if(window.DR_LATEST!==mx){bad++;console.log('draft-room/slates/latest.js says '+window.DR_LATEST+' but the newest slate is day '+mx)}
console.log(bad?bad+' problem(s)':'All slates OK ('+Object.keys(window.DR_SLATES).length+' days)');process.exit(bad?1:0);
