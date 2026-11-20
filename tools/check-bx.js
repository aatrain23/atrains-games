// Validates Box Score Detective slate files. Usage: node tools/check-bx.js
const fs=require('fs'),path=require('path');global.window={};
const dir=path.join(__dirname,'..','box-score','slates');let bad=0;const seen={};
for(const f of fs.readdirSync(dir).filter(f=>/^day-\d+\.js$/.test(f)).sort((a,b)=>parseInt(a.slice(4))-parseInt(b.slice(4)))){
  require(path.join(dir,f));const n=+f.match(/\d+/)[0],R=window.BX_SLATES[n];const err=m=>{bad++;console.log(f+': '+m)};
  if(!Array.isArray(R)||R.length!==6){err('needs exactly 6 rounds');continue}
  for(const r of R){const e=m=>err(r.id+': '+m);
    if(seen[r.id])e('already used in '+seen[r.id]);seen[r.id]=f;
    if(!r.src||!/^https:\/\//.test(r.src.url)||!r.src.label)e('src needs an https url and a label');
    if(!r.why||r.why.length>220)e('why missing or over 220 characters');
    if(/\u2014/.test(JSON.stringify(r)))e('no em dashes');
    for(const k of['sport','year','clue','q','line','options','answer','fact'])if(r[k]===undefined)e('missing '+k);
    if(!Array.isArray(r.line)||r.line.length<4||r.line.length>6)e('line needs 4 to 6 [label, value] stats');
    if(!Array.isArray(r.options)||r.options.length!==4){e('needs exactly 4 options');continue}
    if(!(r.answer>=0&&r.answer<4))e('answer index out of range');if(r.clue.length>90)e('clue over 90 characters');if(r.fact.length>60)e('fact over 60 characters');
    const last=r.options[r.answer].split(' ').pop().toLowerCase();if((r.clue+' '+r.q).toLowerCase().includes(last))e('the clue or question gives away the answer');
  }
}
require(path.join(dir,'latest.js'));const mx=Math.max(...Object.keys(window.BX_SLATES).map(Number));if(window.BX_LATEST!==mx){bad++;console.log('box-score/slates/latest.js says '+window.BX_LATEST+' but the newest slate is day '+mx)}
console.log(bad?bad+' problem(s)':'All slates OK ('+Object.keys(window.BX_SLATES).length+' days)');process.exit(bad?1:0);
