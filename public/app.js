(function(){
"use strict";
var PAGE_SIZE = 5, PAGE_HOME = 3;
var entries = [], shown = 0;

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
  return md.split(/\n\n+/).map(function(b){
    b=b.trim();if(!b)return"";
    if(b.match(/^### /m)){
      return b.split(/\n/).filter(function(l){return l.trim()}).map(function(l){return"<h3>"+l.replace(/^###\s*/,"")+"</h3>"}).join("\n");
    }
    if(b.match(/^- /m)){
      var items=b.split(/\n/).filter(function(l){return l.trim()}).map(function(l){return"<li>"+l.replace(/^-\s*/,"")+"</li>"});
      return"<ul class='md-list'>"+items.join("")+"</ul>";
    }
    return"<p>"+b.replace(/\n/g,"<br>")+"</p>";
  }).join("\n");
}

function cardHtml(e){
  return'<a class="entry-card" href="/entry/'+e.id+'">'+
    '<div class="entry-date">'+(e.date||"")+'</div>'+
    '<div class="entry-title">'+L(e.title)+'</div>'+
    '<div class="entry-highlight">'+(L(e.highlight)||"")+'</div>'+
  '</a>';
}

function renderEntries(container, limit){
  container.innerHTML="";
  shown=0;
  var n=Math.min(limit||entries.length, entries.length);
  for(var i=0;i<n;i++){container.appendChild(el(cardHtml(entries[i])));shown++}
}

// Check if we're on an /entry/<id> page
var entryMatch = window.location.pathname.match(/^\/entry\/([^/]+)\/?$/);
if(entryMatch){
  // Article page — load entries, find match, render
  fetch("/entries.json").then(function(r){return r.json()}).then(function(d){
    entries=(d.entries||[]);
    var id=entryMatch[1], match=null;
    for(var i=0;i<entries.length;i++){if(entries[i].id===id){match=entries[i];break}}
    if(!match){window.location.replace("/");return}
    document.getElementById("article-date").textContent=match.date||"";
    document.getElementById("article-title").textContent=L(match.title);
    var tldr=L(match.tldr)||"";
    var tldrBox=document.getElementById("article-tldr");
    if(tldrBox){if(tldr){tldrBox.style.display="block";tldrBox.innerHTML=tldrHtml(tldr)}else tldrBox.style.display="none"}
    document.getElementById("article-body").innerHTML=mdToHtml(L(match.body));
    document.getElementById("article").style.display="block";
    document.getElementById("list-section").style.display="none";
    document.title = L(match.title) + " — Breakaway";
  });
  // back button
  var btnBack=document.getElementById("btn-back");
  if(btnBack) btnBack.addEventListener("click",function(ev){ev.preventDefault();window.location.href="/articles.html"});
} else {
  // List page (home or articles)
  fetch("/entries.json").then(function(r){return r.json()}).then(function(d){
    entries=(d.entries||[]).sort(function(a,b){return a.date<b.date?1:-1});
    var container=document.getElementById("entry-list");
    if(!container)return;
    var sectionHead=container.closest("section");
    var h2=sectionHead?sectionHead.querySelector("h2"):null;
    var isHome=h2&&h2.textContent.indexOf("ล่าสุด")>=0;
    renderEntries(container, isHome?PAGE_HOME:PAGE_SIZE);
    if(!isHome){
      var btn=document.getElementById("load-more");
      if(btn&&entries.length>PAGE_SIZE)btn.style.display="inline-block";
    }
  });
}
})();
