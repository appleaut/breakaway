(function(){
"use strict";
var PAGE_SIZE = 5, PAGE_HOME = 3;
var entries = [], shown = 0, currentEntry = null;
var DEEP_LIST = "/articles.html", deepLink = false;

function el(html){var d=document.createElement("div");d.innerHTML=html.trim();return d.firstChild}
function L(o){if(!o)return"";if(typeof o==="string")return o;return o.th||""}

function tldrHtml(t){
  if(!t)return"";
  var lines=t.split(/\n+/).map(function(l){return l.replace(/^[•\-]\s*/,"").trim()}).filter(Boolean);
  if(lines.length<=1)return"<p>"+lines[0]+"</p>";
  return"<ul class='tldr-list'>"+lines.map(function(l){return"<li>"+l+"</li>"}).join("")+"</ul>";
}

function mdToHtml(md){
  if(!md)return"";
  var html=md.split(/\n\n+/).map(function(b){
    b=b.trim();if(!b)return"";
    if(b.match(/^- /m)){
      var items=b.split(/\n/).filter(function(l){return l.trim()}).map(function(l){return"<li>"+l.replace(/^-\s*/,"")+"</li>"});
      return"<ul class='md-list'>"+items.join("")+"</ul>";
    }
    return"<p>"+b.replace(/\n/g,"<br>")+"</p>";
  }).join("\n");
  return html;
}

function cardHtml(e){
  return'<div class="entry-card reveal" data-id="'+e.id+'">'+
    '<div class="entry-date">'+(e.date||"")+'</div>'+
    '<div class="entry-title">'+L(e.title)+'</div>'+
    '<div class="entry-highlight">'+(L(e.highlight)||"")+'</div>'+
  '</div>';
}

function renderEntries(container, limit){
  container.innerHTML="";
  shown=0;
  var n=Math.min(limit||entries.length, entries.length);
  for(var i=0;i<n;i++){container.appendChild(el(cardHtml(entries[i])));shown++}
  document.querySelectorAll(".entry-card").forEach(function(c){
    c.addEventListener("click",function(){openArticle(c.dataset.id)});
  });
}

function openArticle(id){
  var match=null;
  entries.forEach(function(e){if(!match&&e.id===id)match=e});
  if(!match){window.location.replace("/");return}
  currentEntry=match;deepLink=true;
  var b=document.querySelector(".banner-wrap");if(b)b.style.display="none";
  var list=document.getElementById("entries")||document.getElementById("entry-list");
  if(list)list.closest(".section").style.display="none";
  document.getElementById("article-date").textContent=match.date||"";
  document.getElementById("article-title").textContent=L(match.title);
  var tldr=L(match.tldr)||"";
  var tldrBox=document.getElementById("article-tldr");
  if(tldrBox){if(tldr){tldrBox.style.display="block";tldrBox.innerHTML=tldrHtml(tldr)}else tldrBox.style.display="none"}
  document.getElementById("article-body").innerHTML=mdToHtml(L(match.body));
  document.getElementById("article").style.display="block";
  window.scrollTo(0,0);
}

function closeArticle(){
  currentEntry=null;
  var b=document.querySelector(".banner-wrap");if(b)b.style.display="";
  var list=document.getElementById("entries")||document.getElementById("entry-list");
  var sec=list?list.closest(".section"):null;
  if(sec)sec.style.display="";
  document.getElementById("article").style.display="none";
  history.replaceState(null,"",window.location.pathname);
}

var btnBack=document.getElementById("btn-back");
if(btnBack)btnBack.addEventListener("click",function(ev){
  ev.preventDefault();
  if(deepLink){window.location.href=DEEP_LIST;return}
  closeArticle();
});

// init
fetch("/entries.json").then(function(r){return r.json()}).then(function(d){
  entries=(d.entries||[]).sort(function(a,b){return a.date<b.date?1:-1});
  var isArticlesPage=!!document.getElementById("entry-list")&&!document.querySelector(".section-head h2")?.textContent.includes("ล่าสุด");
  if(isArticlesPage){
    renderEntries(document.getElementById("entry-list"), PAGE_SIZE);
    var btn=document.getElementById("load-more");
    if(btn&&entries.length>PAGE_SIZE){btn.style.display="inline-block";btn.addEventListener("click",function(){window.location.href="/"})}
  }else{
    renderEntries(document.getElementById("entry-list"), PAGE_HOME);
  }
  if(window.location.pathname.match(/^\/entry\/([^/]+)\/?$/)){
    var m=window.location.pathname.match(/^\/entry\/([^/]+)\/?$/);
    if(m)openArticle(m[1]);
  }
}).catch(function(){});
})();
