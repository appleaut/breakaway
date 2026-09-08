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
  return'<div class="entry-card" data-id="'+e.id+'">'+
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
  // attach click handlers
  var cards = container.querySelectorAll(".entry-card");
  for(var i=0;i<cards.length;i++){
    (function(card){
      card.addEventListener("click",function(ev){
        ev.preventDefault();
        var id = card.getAttribute("data-id");
        if(id) openArticle(id);
      });
    })(cards[i]);
  }
}

function openArticle(id){
  var match=null;
  for(var i=0;i<entries.length;i++){
    if(entries[i].id===id){match=entries[i];break}
  }
  if(!match){return}
  currentEntry=match;
  deepLink=true;
  // hide list section
  var section = document.getElementById("entries");
  if(section) section.style.display="none";
  // fill article
  document.getElementById("article-date").textContent=match.date||"";
  document.getElementById("article-title").textContent=L(match.title);
  var tldr=L(match.tldr)||"";
  var tldrBox=document.getElementById("article-tldr");
  if(tldrBox){
    if(tldr){tldrBox.style.display="block";tldrBox.innerHTML=tldrHtml(tldr)}
    else{tldrBox.style.display="none"}
  }
  document.getElementById("article-body").innerHTML=mdToHtml(L(match.body));
  document.getElementById("article").style.display="block";
  window.scrollTo(0,0);
}

function closeArticle(){
  currentEntry=null;
  var section = document.getElementById("entries");
  if(section) section.style.display="";
  document.getElementById("article").style.display="none";
}

var btnBack=document.getElementById("btn-back");
if(btnBack) btnBack.addEventListener("click",function(ev){
  ev.preventDefault();
  closeArticle();
});

// init
fetch("/entries.json").then(function(r){return r.json()}).then(function(d){
  entries=(d.entries||[]).sort(function(a,b){return a.date<b.date?1:-1});
  var container = document.getElementById("entry-list");
  if(!container) return;
  var isHome = container.closest(".section") && container.closest(".section").querySelector("h2") && container.closest(".section").querySelector("h2").textContent.indexOf("ล่าสุด") >= 0;
  if(isHome){
    renderEntries(container, PAGE_HOME);
  } else {
    renderEntries(container, PAGE_SIZE);
    var btn=document.getElementById("load-more");
    if(btn && entries.length>PAGE_SIZE){btn.style.display="inline-block"}
  }
}).catch(function(e){console.error("init error:",e)});
})();
