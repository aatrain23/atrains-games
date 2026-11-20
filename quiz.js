/* Shared engine for the card-based quiz games (Trade Desk, Box Score Detective).
   A game page calls Quiz.start({ name, slates, latest, key, epoch, ranks, good, bad, next, head, ask, build, reveal, result, row }).
   It handles the day loader (midnight US Eastern switch, fallback to the newest earlier day, ?day=N preview), progress, scoring and the streak. */
window.Quiz=(function(){
  "use strict";
  function $(i){return document.getElementById(i)}
  function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
  function store(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
  function game(cfg,DAY,R){
    var i=0,res=[],answered=false;
    function dots(){$("dots").textContent="";R.forEach(function(r,j){$("dots").appendChild(el("span","dot "+(res[j]===undefined?(j===i?"now":""):(res[j]?"ok":"no")),String(j+1)))})}
    function load(){answered=false;var r=R[i],h=cfg.head(r);$("verdict").hidden=true;$("sub").textContent="Day "+DAY+"  ·  "+(i+1)+" of "+R.length;
      $("rt").textContent=h[0];$("rn").textContent=h[1];$("cap").textContent=cfg.ask(r);$("body").textContent="";cfg.build(r,$("body"),answer,el);dots()}
    function answer(j){if(answered)return;answered=true;var r=R[i],ok=j===r.answer;res[i]=ok;cfg.reveal(r,j,$("body"),el);
      $("cap").textContent=cfg.result(r,ok,j);$("vh").textContent=ok?cfg.good:cfg.bad;$("vh").style.color=ok?"var(--green)":"var(--red)";
      $("fact").textContent=r.fact||"";$("fact").hidden=!r.fact;$("why").textContent=r.why;$("src").href=r.src.url;$("src").textContent="Source: "+r.src.label+" ↗";
      $("next").textContent=i===R.length-1?"See my score":cfg.next;$("verdict").hidden=false;dots();$("next").focus({preventScroll:true})}
    function grid(){return res.map(function(x){return x?"🟩":"🟥"}).join("")}
    function finish(){var n=res.filter(Boolean).length;$("play").hidden=true;$("done").hidden=false;$("sub").textContent="Day "+DAY+"  ·  Final";
      $("score").textContent=n;$("rank").textContent=cfg.ranks[n];$("grid").textContent=grid();$("rows").textContent="";
      R.forEach(function(r,j){var x=cfg.row(r),li=el("li"),a=el("span");a.appendChild(el("b","",x[0]));li.appendChild(a);li.appendChild(el("span","",x[1]+" "+(res[j]?"✓":"✗")));$("rows").appendChild(li)});
      var s=store(cfg.key)||{};if(s.last!==DAY){s.streak=(s.last===DAY-1?(s.streak||0):0)+1;s.last=DAY;s.first=n}s.best=Math.max(s.best||0,n);store(cfg.key,s);
      $("streak").textContent=s.streak?"Streak: "+s.streak+" day"+(s.streak>1?"s":"")+"  ·  Best: "+s.best+"/"+R.length:"";dots()}
    $("next").onclick=function(){if(i===R.length-1){finish();return}i++;load();window.scrollTo({top:0})};
    $("review").onclick=function(){i=0;res=[];$("done").hidden=true;$("play").hidden=false;load()};
    $("copy").onclick=function(){var t=cfg.name+" · Day "+DAY+"\n"+grid()+"  "+res.filter(Boolean).length+"/"+R.length,b=this;
      function ok(){b.textContent="Copied";setTimeout(function(){b.textContent="Copy my score"},1600)}
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,function(){b.textContent=t});else b.textContent=t};
    window.__quiz={answer:answer};load()}
  function start(cfg){
    function todayN(){try{var s=new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()).split("-");
      return 1+Math.round((Date.UTC(+s[0],+s[1]-1,+s[2])-Date.UTC(cfg.epoch[0],cfg.epoch[1]-1,cfg.epoch[2]))/864e5)}catch(e){return 1}}
    function tryDay(n,left){if(n<1||left<0){$("cap").textContent="Couldn't load today's set. Refresh to try again.";return}
      var s=document.createElement("script");s.src="slates/day-"+n+".js?v="+n;
      s.onload=function(){var R=(window[cfg.slates]||{})[n];if(R&&R.length)game(cfg,n,R);else tryDay(n-1,left-1)};
      s.onerror=function(){tryDay(n-1,left-1)};document.head.appendChild(s)}
    var q=+new URLSearchParams(location.search).get("day"),l=document.createElement("script");
    function go(){var latest=window[cfg.latest]||todayN();tryDay(q>0?Math.min(q,latest):Math.max(1,Math.min(todayN(),latest)),30)}
    l.src="slates/latest.js?v="+Math.floor(Date.now()/6e5);l.onload=go;l.onerror=go;document.head.appendChild(l)}
  return {start:start};
})();
