// Validates Beat the Bookie slate files. Usage: node tools/check-bb.js
const fs=require('fs'),path=require('path');global.window={};
const dir=path.join(__dirname,'..','beat-the-bookie','slates');let bad=0;const seen={};
for(const f of fs.readdirSync(dir).filter(f=>/^day-\d+\.js$/.test(f)).sort((a,b)=>parseInt(a.slice(4))-parseInt(b.slice(4)))){
  require(path.join(dir,f));const n=+f.match(/\d+/)[0],R=window.BB_SLATES[n];const err=m=>{bad++;console.log(f+': '+m)};
  if(!Array.isArray(R)||R.length!==6){err('needs exactly 6 rounds');continue}
  for(const r of R){const e=m=>err(r.id+': '+m);
    if(seen[r.id])e('already used in '+seen[r.id]);seen[r.id]=f;
    if(!r.src||!/^https:\/\//.test(r.src.url)||!r.src.label)e('src needs an https url and a label');
    if(!r.why||r.why.length>220)e('why missing or over 220 characters');
    if(/\u2014/.test(JSON.stringify(r)))e('no em dashes');
    for(const k of['sport','when','event','line','sides','answer','fact'])if(r[k]===undefined)e('missing '+k);
    if(!(r.line>0))e('line must be a positive number of points');
    if(!Array.isArray(r.sides)||r.sides.length!==2){e('needs exactly 2 sides: favorite first, underdog second');continue}
    if(r.answer!==0&&r.answer!==1)e('answer must be 0 (favorite covered) or 1 (underdog covered)');if(r.fact.length>70)e('fact over 70 characters');
    r.sides.forEach(s=>{if(!s.team||!s.record||!Array.isArray(s.facts)||s.facts.length<2||s.facts.length>4)e('each side needs team, record and 2 to 4 facts');
      else{if(s.facts.some(g=>g.length>64))e(s.team+': fact over 64 characters');
        const shown=(s.record+' '+s.facts.join(' ')).toLowerCase();r.sides.forEach(o=>o.team.toLowerCase().split(' ').filter(w=>w.length>3).forEach(w=>{if(new RegExp('\\b'+w+'\\b').test(shown))e('a fact gives away a team name: '+w)}))}});
  }
}
require(path.join(dir,'latest.js'));const mx=Math.max(...Object.keys(window.BB_SLATES).map(Number));if(window.BB_LATEST!==mx){bad++;console.log('beat-the-bookie/slates/latest.js says '+window.BB_LATEST+' but the newest slate is day '+mx)}
console.log(bad?bad+' problem(s)':'All slates OK ('+Object.keys(window.BB_SLATES).length+' days)');process.exit(bad?1:0);
