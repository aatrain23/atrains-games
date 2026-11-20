// Validates slate files. Usage: node tools/check.js            (all days)
const fs=require('fs'),path=require('path');global.window={};
const dir=path.join(__dirname,'..','youre-the-ref','slates');let bad=0;const seen={};
const SPORTS=['nfl','nba','nhl','mlb','pga','lax'];
for(const f of fs.readdirSync(dir).filter(f=>/^day-\d+\.js$/.test(f)).sort((a,b)=>parseInt(a.slice(4))-parseInt(b.slice(4)))){
  require(path.join(dir,f));const n=+f.match(/\d+/)[0],P=window.YTR_SLATES[n];const err=m=>{bad++;console.log(f+': '+m)};
  if(!Array.isArray(P)||P.length!==6){err('needs exactly 6 plays');continue}
  if(P.map(p=>p.sport).join()!==SPORTS.join())err('sports must be in order '+SPORTS.join(', '));
  for(const p of P){const e=m=>err(p.id+': '+m);
    for(const k of['id','sport','league','title','dur','view','setup','caps','after','actors','ball','options','answer','stamp','why','law','twist'])if(p[k]===undefined)e('missing '+k);
    if(seen[p.id])e('id already used in '+seen[p.id]);seen[p.id]=f;
    if(!(p.answer>=0&&p.answer<p.options.length))e('answer index out of range');
    if(p.options.length<2||p.options.length>3)e('2 or 3 options');
    if(p.options.some(o=>o.length>34))e('option over 34 characters');
    if(p.stamp.length>16)e('stamp over 16 characters');if(p.law.length>60)e('law over 60 characters');
    if(p.why.length>260)e('why over 260 characters');if(p.twist.length>120)e('twist over 120 characters');
    const keys=(k,w)=>{for(let i=1;i<k.length;i++)if(k[i][0]<k[i-1][0])e(w+' keyframe times not ascending')};
    keys(p.ball,'ball');p.actors.forEach(a=>{keys(a.k,'actor '+(a.n||a.shape));if(!a.shape&&!['a','b','gk','ref'].includes(a.team))e('bad team '+a.team)});
    if(p.ball[p.ball.length-1][0]>p.dur+0.01)e('ball keyframe after dur');
    const last=p.caps[p.caps.length-1];if(p.caps[0][0]!==0||last[1]<p.dur)e('captions must cover 0..dur');
    const [x0,y0,x1,y1]=p.view;p.ball.forEach(k=>{if(k[0]>0&&(k[1]<x0-8*(x1-x0)/50||k[1]>x1+8*(x1-x0)/50||k[2]<y0-8*(y1-y0)/50||k[2]>y1+8*(y1-y0)/50))e('ball far outside view at t='+k[0])});
    if(p.clip&&!/^https:\/\//.test(p.clip.url))e('clip url must be https');
  }
}
require(path.join(dir,'latest.js'));const mx=Math.max(...Object.keys(window.YTR_SLATES).map(Number));if(window.YTR_LATEST!==mx){bad++;console.log('slates/latest.js says '+window.YTR_LATEST+' but the newest slate is day '+mx)}
console.log(bad?bad+' problem(s)':'All slates OK ('+Object.keys(window.YTR_SLATES).length+' days)');process.exit(bad?1:0);
